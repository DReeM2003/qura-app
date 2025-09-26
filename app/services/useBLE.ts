/* eslint-disable n0-bitwise */
import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";


interface BluetoothLowEnergyApi {
    requestPermisssions(): Promise<boolean>;
    scanForPeripherals(): void;
}

function useBLE(): BluetoothLowEnergyApi{
    const bleManager = useMemo(() => new BleManager(), []);
    const [allDevices, setAlldevices] = useState<Device[]>([]);

    const requestAndroid31Permissions = async () =>{
        const bluetoothScanPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
                title: "Connect Permission",
                message:"App requires Bluetooth Connection",
                buttonPositive:"OK",

            }
        );
        const bluetoothConnectPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: "Scan Permission",
                message:"App requires Bluetooth Scanning",
                buttonPositive:"OK",

            }
        );
        const bluetoothFineLocationPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission",
                message:"App requires access to location",
                buttonPositive:"OK",

            }
        );

        return(
            bluetoothScanPermissions === "granted" &&
            bluetoothConnectPermissions === "granted" &&
            bluetoothFineLocationPermissions === "granted"
        );
    };

    const requestPermisssions = async () =>{
        if(Platform.OS === "android"){
            if((ExpoDevice.platformApiLevel ?? -1) < 31){
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message:"App requires access to location",
                        buttonPositive:"OK",
                    }
                )
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else{
                const isAndroid31PermissionGranted = 
                    await requestAndroid31Permissions();
                return isAndroid31PermissionGranted;
            }
        } else{
            return true;
        }
    };

    const scanForPeripherals = () =>{
        
    }
    return{
        scanForPeripherals,
        requestPermisssions,
    }
}

export default useBLE;