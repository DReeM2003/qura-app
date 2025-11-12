// hooks/useBLE.ts
/* eslint-disable no-bitwise */
import { decode as atob, encode as btoa } from "base-64";
import * as ExpoDevice from "expo-device";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

// Nordic UART Service (NUS) UUIDs — very common on nRF52/NINA
const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX_CHAR  = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify (device → phone)
const NUS_TX_CHAR  = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write  (phone → device)
// Debug helper: when true, show all discovered devices in the list (not just NUS/name-matched)
const DEBUG_SHOW_ALL_DEVICES = false;

export type BleLog = { ts: number; dir: "in" | "out" | "sys"; text: string };

export interface BluetoothLowEnergyApi {
  // state
  isScanning: boolean;
  devices: Device[];
  connectedDevice: Device | null;
  lastMessage: string | null;
  logs: BleLog[];

  // actions
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(durationMs?: number): Promise<void>;
  stopScan(): void;
  connectToDevice(d: Device): Promise<Device | null>;
  disconnect(): Promise<void>;
  writeLine(text: string): Promise<void>;
  clearDevices(): void; // New method to clear device list
}

export default function useBLE(): BluetoothLowEnergyApi {
  const manager = useMemo(() => new BleManager(), []);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<BleLog[]>([]);
  const [btState, setBtState] = useState<string>("Unknown");
  const unsubRefs = useRef<(() => void)[]>([]);
  const scanningRef = useRef(false);

  const log = useCallback((dir: BleLog["dir"], text: string) => {
    setLogs(prev => [{ ts: Date.now(), dir, text }, ...prev].slice(0, 200));
  }, []);

  // ---- Permissions (Android) ----
  const requestAndroid31Permissions = async () => {
    const scan = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
    const connect = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
    const fine = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return scan === "granted" && connect === "granted" && fine === "granted";
  };

  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== "android") return true;
    const api = ExpoDevice.platformApiLevel ?? 0;
    if (api >= 31) return requestAndroid31Permissions();
    const fine = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return fine === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  // ---- Scan ----
  const addDevice = useCallback((d: Device) => {
    setDevices(prev => (prev.find(p => p.id === d.id) ? prev : [...prev, d]));
  }, []);

  const stopScan = useCallback(() => {
    try {
      manager.stopDeviceScan();
    } catch {}
    scanningRef.current = false;
    setIsScanning(false);
    log("sys", "scan: stopped");
  }, [manager, log]);

  const scanForPeripherals = useCallback(
    async (durationMs = 8000) => {
      if (scanningRef.current || isScanning) {
        log("sys", "scan already in progress");
        return;
      }
      try {
        const ok = await requestPermissions();
        if (!ok) {
          log("sys", "permissions denied or not granted");
          return;
        }
        // Ensure Bluetooth is powered on before scanning
        const current = await manager.state();
        if (current !== "PoweredOn") {
          log("sys", `bluetooth not powered on (${current})`);
          return;
        }
        setDevices([]);
        setIsScanning(true);
        scanningRef.current = true;
        log("sys", "scan: started");
        manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
          if (error) {
            log("sys", `scan error: ${error.message}`);
            stopScan();
            return;
          }
          if (!device) return;

          const name = (device.name || "").toLowerCase();
          const hasNus = (device.serviceUUIDs || []).some(u => u?.toLowerCase() === NUS_SERVICE);

          // Log every advertisement to help diagnose discovery issues
          const suuids = (device.serviceUUIDs || []).join(",");
          log("sys", `adv: ${device.name || 'Unnamed'} (${device.id}) RSSI=${device.rssi ?? 'n/a'} UUIDs=[${suuids}]`);

          // Keep it simple: match "nina"/"ublox"/"qura" or NUS service
          if (DEBUG_SHOW_ALL_DEVICES || hasNus || name.includes("nina") || name.includes("ublox") || name.includes("qura")) {
            addDevice(device);
          }
        });

        setTimeout(stopScan, durationMs);
      } catch (e: any) {
        log("sys", `scan threw: ${e?.message || e}`);
        stopScan();
      }
    },
    [requestPermissions, manager, stopScan, addDevice, log, isScanning]
  );

  // ---- Connect / Notifications ----
  const clearSubscriptions = useCallback(() => {
    unsubRefs.current.forEach(unsub => {
      try { unsub(); } catch {}
    });
    unsubRefs.current = [];
  }, []);

  const connectToDevice = useCallback(
    async (device: Device) => {
      try {
        log("sys", `connecting to ${device.name || device.id}…`);
        // Avoid autoConnect to reduce erratic behavior on Android
        const d1 = await manager.connectToDevice(device.id);
        const d2 = await d1.discoverAllServicesAndCharacteristics();
        setConnectedDevice(d2);
        log("sys", "connected");

        // Monitor NUS RX notifications
        const sub = manager.monitorCharacteristicForDevice(
          d2.id,
          NUS_SERVICE,
          NUS_RX_CHAR,
          (error, c) => {
            if (error) {
              log("sys", `notify error: ${error.message}`);
              return;
            }
            if (!c?.value) return;
            // NUS sends binary -> base64; decode to text
            const binary = atob(c.value);       // base64 -> ASCII string
            const text = binary;                // if your payload is plain ASCII
            setLastMessage(text);
            log("in", text.trim());
          }
        );
        unsubRefs.current.push(() => sub.remove());
        return d2;
      } catch (e: any) {
        log("sys", `connect failed: ${e?.message || e}`);
        return null;
      }
    },
    [manager, log]
  );

  const disconnect = useCallback(async () => {
    try {
      clearSubscriptions();
      if (connectedDevice) {
        await manager.cancelDeviceConnection(connectedDevice.id);
        log("sys", "disconnected");
      }
    } catch {}
    setConnectedDevice(null);
  }, [connectedDevice, manager, clearSubscriptions, log]);

  // ---- Write (TX) ----
  const writeLine = useCallback(
    async (text: string) => {
      if (!connectedDevice) return;
      const payload = text.endsWith("\n") ? text : text + "\n";
      const base64 = btoa(payload);
      try {
        await manager.writeCharacteristicWithResponseForDevice(
          connectedDevice.id,
          NUS_SERVICE,
          NUS_TX_CHAR,
          base64
        );
        log("out", text.trim());
      } catch (e: any) {
        log("sys", `write failed: ${e?.message || e}`);
      }
    },
    [connectedDevice, manager, log]
  );

  // ---- Cleanup ----
  useEffect(() => {
    // Track Bluetooth adapter state
    const sub = manager.onStateChange((state) => {
      setBtState(state);
      if (state !== "PoweredOn") {
        setIsScanning(false);
      }
    }, true);
    return () => {
      stopScan();
      clearSubscriptions();
      manager.destroy();
      try { sub.remove(); } catch {}
    };
  }, [manager, stopScan, clearSubscriptions]);

  const clearDevices = useCallback(() => {
    setDevices([]);
  }, []);

  return {
    isScanning,
    devices,
    connectedDevice,
    lastMessage,
    logs,

    requestPermissions,
    scanForPeripherals,
    stopScan,
    connectToDevice,
    disconnect,
    writeLine,
    clearDevices,
  };
}
