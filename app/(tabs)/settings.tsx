import { StyleSheet, Text, View } from "react-native";

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QURA Band Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.metric}>Steps: 8,542</Text>
        <Text style={styles.metric}>Blood Oxygen: 98%</Text>
        <Text style={styles.metric}>Respiratory Rate: 16 bpm</Text>
        <Text style={styles.metric}>Heart Rate: 74 bpm</Text>
        <Text style={styles.metric}>Blood Temp: 36.8°C</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#ff2ec4", marginBottom: 20 },
  card: { backgroundColor: "#f9f9f9", borderRadius: 16, padding: 20 },
  metric: { fontSize: 18, marginBottom: 10, color: "#333" },
});