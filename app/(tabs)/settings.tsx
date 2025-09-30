// app/(tabs)/settings.tsx
import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useBLEContext } from "../context/BLEContext";

type SettingsOption = {
  id: number;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

const SETTINGS_OPTIONS: SettingsOption[] = [
  { id: 1, title: "Account", subtitle: "Privacy, security, change number" },
  { id: 2, title: "Chats", subtitle: "Chat history, app shortcuts" },
  { id: 3, title: "Notifications", subtitle: "Message, calendar" },
  { id: 4, title: "Storage and data", subtitle: "Network usage, auto-download" },
  { id: 5, title: "Appearance", subtitle: "Themes" },
  { id: 6, title: "Help", subtitle: "FAQ, contact us, terms and conditions" },
];

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled] = useState<boolean>(true);
  const [darkMode] = useState<boolean>(false);

  const {
    isScanning,
    devices,
    scanForPeripherals,
    stopScan,
    connectToDevice,
    disconnect,
    connectedDevice,
    lastMessage,
    writeLine,
  } = useBLEContext();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Bluetooth</Text>

            <TouchableOpacity
              style={[styles.scanButton, isScanning && { opacity: 0.6 }]}
              onPress={() => (isScanning ? stopScan() : scanForPeripherals(8000))}
              activeOpacity={0.85}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? "Stop Scan" : "Scan for Devices"}
              </Text>
            </TouchableOpacity>

            {connectedDevice && (
              <View style={styles.connectedBox}>
                <Text style={styles.connectedTitle}>
                  Connected: {connectedDevice.name || connectedDevice.id}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <TouchableOpacity onPress={() => writeLine("ping")}>
                    <Text style={styles.actionLink}>Send ping</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={disconnect} style={{ marginLeft: 20 }}>
                    <Text style={[styles.actionLink, { color: "#ff4f6d" }]}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtleText}>
                  Last message: {lastMessage?.trim() || "—"}
                </Text>
              </View>
            )}

            {!connectedDevice && devices.length === 0 && !isScanning && (
              <Text style={styles.subtleText}>No devices yet. Start a scan.</Text>
            )}

            {devices.map(d => {
              const selected = connectedDevice?.id === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.deviceRow, selected && { borderColor: "#ff2ec4" }]}
                  onPress={() => (selected ? disconnect() : connectToDevice(d))}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deviceName}>{d.name || "Unnamed"}</Text>
                    <Text style={styles.deviceId}>{d.id}</Text>
                  </View>
                  <Text style={styles.deviceAction}>{selected ? "Disconnect" : "Connect"}</Text>
                </TouchableOpacity>
              );
            })}
        </View>

        <View style={styles.sectionContainer}>
          {SETTINGS_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionRow}
              onPress={opt.onPress ?? (() => Alert.alert(opt.title, opt.subtitle ?? ""))}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                {opt.subtitle ? <Text style={styles.optionSubtitle}>{opt.subtitle}</Text> : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#06060f" },
  scrollContent: { padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#ff2ec4" },

  sectionContainer: {
    backgroundColor: "#16161f",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },

  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
    opacity: 0.8,
    letterSpacing: 0.5,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2b2f3a",
  },
  optionTitle: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  optionSubtitle: { fontSize: 12, color: "#9aa0b5", marginTop: 2 },
  chevron: { color: "#555", fontSize: 22, paddingHorizontal: 4 },

  scanButton: {
    backgroundColor: "#ff2ec4",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  scanButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  connectedBox: {
    backgroundColor: "#1d1d27",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2b2f3a",
  },
  connectedTitle: { color: "#ffffff", fontWeight: "700", fontSize: 14 },

  actionLink: { color: "#ff2ec4", fontWeight: "600" },
  subtleText: { color: "#7c8394", fontSize: 12, marginBottom: 12 },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2b2f3a",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#1a1a23",
  },
  deviceName: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  deviceId: { color: "#7c8394", fontSize: 10, marginTop: 2 },
  deviceAction: { color: "#ff2ec4", fontWeight: "600", fontSize: 12 },
});
