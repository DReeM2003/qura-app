// app/(tabs)/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useBLEContext } from "../context/BLEContext"; // adjust path to where your BLEContext lives


const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const router = useRouter();
 
 const {isScanning, devices, scanForPeripherals,stopScan,connectToDevice,disconnect,connectedDevice, lastMessage,writeLine,} = useBLEContext();
  const handleEditProfile = () =>
   router.push("/components/edit_profile");
  const handleLogout = () =>
    Alert.alert("Logout", "This feature is not implemented yet.");
  const handleSupport = () =>
    Alert.alert("Support", "This feature is not implemented yet.");
  const handleNotificationsToggle = () => setNotificationsEnabled(!notificationsEnabled);
  const handleBluetoothToggle = () =>
    setBluetoothEnabled(!bluetoothEnabled);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Settings</Text>

      //Bluetooth Section
       <View style={[styles.section, { backgroundColor: "#16161f" }]}>
       <Text style={[styles.sectionTitle, { color: "#E7E8EB" }]}>Bluetooth</Text>
       
       <TouchableOpacity
       style={[styles.scanButton, isScanning && { opacity: 0.6 }]}
       onPress={() => (isScanning ? stopScan() : scanForPeripherals(8000))}
       activeOpacity={0.8}
     >
       <Text style={styles.scanButtonText}>
         {isScanning ? "Stop Scan" : "Scan for Devices"}
       </Text>
     </TouchableOpacity>
 
      {connectedDevice && (
     <View style={styles.connectedBox}>
       <Text style={[styles.connectedTitle, { color: "#E5E7EB" }]}>
         Connected: {connectedDevice.name || connectedDevice.id}
       </Text>
 
       <View style={{ flexDirection: "row", marginTop: 8 }}>
         <TouchableOpacity onPress={() => writeLine("ping")}>
           <Text style={styles.actionLink}>Send Ping</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={disconnect} style={{ marginLeft: 20 }}>
           <Text style={[styles.actionLink, { color: "#ff4f6d" }]}>
             Disconnect
           </Text>
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
 
    {devices.map((d: { 
      id: boolean | React.ReactElement<unknown, string | 
      React.JSXElementConstructor<any>> | 
      Iterable<React.ReactNode> | 
      Promise<string | number | bigint | boolean | 
      React.ReactPortal | React.ReactElement<unknown, string |
      React.JSXElementConstructor<any>> |
      Iterable<React.ReactNode> | null | undefined> | 
      React.Key | null | undefined; name: any; }) => { const selected = connectedDevice?.id === d.id;
     return (
       <TouchableOpacity
         key={d.id ? d.id.toString() : `device-${id.name}`}
         style={[styles.deviceRow, selected && { borderColor: "#e342bb" }]}
         onPress={() => (selected ? disconnect() : connectToDevice(d))}
         activeOpacity={0.8}
       >
         <View style={{ flex: 1 }}>
           <Text style={[styles.deviceName, { color: "#E7E8EB" }]}> 
             {d.name || "Unnamed"}
           </Text>
           <Text style={styles.deviceId}>{d.id}</Text>
         </View>
         <Text style={[styles.deviceAction, { color: "#e342bb" }]}>
           {selected ? "Disconnect" : "Connect"}
         </Text>
       </TouchableOpacity>
     );
   })}
 </View>
    
      //Account Section
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.row} onPress={handleEditProfile}>
          <Text style={styles.optionText}>Edit Profile</Text>
          <Ionicons name="person-circle-outline" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: "#ff4f6d" }]}>Logout</Text>
          <Ionicons name="log-out-outline" size={20} color="#ff4f6d" />
        </TouchableOpacity>
      </View>

      // Notifications Section 
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color="#e342bb" />
          <Text style={styles.optionText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: "#ccc", true: "#e342bb" }}
            thumbColor={notificationsEnabled ? "#e342bb" : "#f4f3f4"}
          />
        </View>
      </View>

      // Support Section 
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.row} onPress={handleSupport}>
          <Text style={styles.optionText}>Contact Support</Text>
          <Ionicons name="help-circle-outline" size={20} color="#e342bb" /> // Pink icon
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}; 

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F", // Dark background
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#e342bb",// Pinkish header
  },
  section: {
    backgroundColor: "#16161f", // Slightly lighter dark background
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000", // subtle shadow
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#E7E8EB", // Light section title color
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB", // Light border color
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: "#E5E7EB", // Light text color
  },
 
scanButton: {
  backgroundColor: "#FF2EC4", // Pink button
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center",
  marginBottom: 12,
},
scanButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
connectedBox: {
  backgroundColor: "#1d1d27", // Slightly lighter dark box
  borderRadius: 12,
  padding: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#2b2f3a", // subtle border
},
connectedTitle: { fontWeight: "700", fontSize: 14 },
actionLink: { color: "#FF2EC4", fontWeight: "600" }, // pink action link
subtleText: { color: "#7c8394", fontSize: 12, marginBottom: 12 }, // lighter text
deviceRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderWidth: 1,
  borderColor: "#2b2f3a", // subtle border
  borderRadius: 10,
  paddingHorizontal: 12,
  marginBottom: 8,
},
deviceName: { fontWeight: "600", fontSize: 14 },
deviceId: { color: "#7c8394", fontSize: 10, marginTop: 2 }, // lighter text
deviceAction: { fontWeight: "600", fontSize: 12 },

});
