import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useBLEContext } from "../context/BLEContext";
import { useSensorData } from "../hooks/useSensorData";

const ICON = {
  steps: require("../../assets/icons/steps.png"),
  blood_oxygen: require("../../assets/icons/blood_oxygen.png"),
  heart: require("../../assets/icons/heart.png"),
  resp_rate: require("../../assets/icons/resp_rate.png"),
  temp: require("../../assets/icons/temp.png"),
};

export default function Dashboard() {
  const { width } = Dimensions.get("window");
  const { simulationMode, connectedDevice } = useBLEContext();

  const neon = "#ff2ec4";
  const neon2 = "#ff6ef2";

  const H = 16;
  const ROW_GAP = 12; // vertical spacing between rows
  const tabBarHeight = useBottomTabBarHeight();
  const { bottom: insetBottom } = useSafeAreaInsets();
  const MARGIN_BELOW_BAR = 25;
  const bottomClearance = tabBarHeight + insetBottom + MARGIN_BELOW_BAR;

  const contentWidth = width - H * 2; // inner width used for steps + rows
  const topSize = 350;
  const ROW_HEIGHT = 65; // <— adjust this to change container height
  
  const { data: sensorData, isConnected, isStale, requestUpdate } = useSensorData();
  const staleData = isStale();

  // Format sensor values with appropriate units
  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return "—";
    return `${value}${unit}`;
  };

  const StepsRing = ({ steps = 5000, goal = 10000 }) => {
    const size = topSize;
    const stroke = 14;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(steps / goal, 1);
    const dash = circumference * progress;

    return (
      <View style={styles.ringWrap}>
        <Svg width={size} height={size}>
          <Circle cx={size/2} cy={size/2} r={radius} stroke="#242B36" strokeOpacity={0.9} strokeWidth={stroke} fill="none" />
          <Circle cx={size/2} cy={size/2} r={radius} stroke={neon} strokeWidth={stroke} fill="none"
                  strokeLinecap="round" strokeDasharray={`${dash}, ${circumference}`}
                  transform={`rotate(-90 ${size/2} ${size/2})`} />
          <Circle cx={size/2} cy={size/2} r={radius} stroke={neon2} strokeWidth={stroke} fill="none"
                  strokeLinecap="round" strokeDasharray={`${Math.min(stroke * 2, dash)}, ${circumference}`}
                  transform={`rotate(${Math.max(progress * 360 - 90, -90)} ${size/2} ${size/2})`} opacity={0.9} />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
          <Image source={ICON.steps} style={{ width: 20, height: 20, tintColor: "#aaa", marginTop: 6 }} />
          <Text style={styles.stepsLabel}>steps</Text>
        </View>
      </View>
    );
  };

  const metrics = [
    { key: "hr",   title: "Heart Rate",       value: formatValue(sensorData.heartRate, " bpm"),  image: ICON.heart },
    { key: "spo2", title: "Blood Oxygen",     value: formatValue(sensorData.spo2, "%"),     image: ICON.blood_oxygen },
    { key: "resp", title: "Respiratory Rate",  value: formatValue(sensorData.respRate, " br/m"), image: ICON.resp_rate },
    { key: "temp", title: "Body Temp.",       value: formatValue(sensorData.temperature, "°F"),  image: ICON.temp },
  ];

  return (
    <View style={styles.screen}>
      {/* Fixed header with connection status */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Derek!</Text>
        <View style={styles.connectionInfo}>
          <View style={[styles.statusDot, { 
            backgroundColor: isConnected ? '#4CAF50' : '#FF9800' 
          }]} />
          <Text style={styles.connectionText}>
            {isConnected ? (
              simulationMode ? 
                'Simulator Mode' : 
                `${(connectedDevice?.name || connectedDevice?.id || '').slice(0, 8)}`
            ) : 'Disconnected'}
          </Text>
          {/* Battery life display */}
          {sensorData.batteryLife !== null && (
            <Text style={styles.batteryText}>{`🔋 ${sensorData.batteryLife}%`}</Text>
          )}
          <Pressable onPress={requestUpdate} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>↻</Text>
          </Pressable>
        </View>
      </View>

      {/* Fixed steps square */}
      <View style={{ paddingHorizontal: H }}>
        <View style={[styles.topCard, { width: topSize, height: topSize }]}>
          <StepsRing steps={sensorData.steps || 0} goal={10000} />
        </View>
        <View style={[styles.divider, { width: topSize }]} />
      </View>

      {/* Scrollable metrics (1 x N) */}
      <FlatList
        data={metrics}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingHorizontal: H,
          paddingBottom: bottomClearance,
          // use either rowGap OR marginBottom on row, not both. We'll use rowGap:
          rowGap: ROW_GAP,
        }}
        scrollIndicatorInsets={{ bottom: bottomClearance }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.rowCard, { width: contentWidth, height: ROW_HEIGHT }]}>
            {/* LEFT cluster: icon + label */}
            <View style={styles.rowLeft}>
              <Image source={item.image} style={styles.rowIcon} />
              <Text style={styles.metricTitle}>{item.title}</Text>
            </View>
            {/* RIGHT: value */}
            <Text style={styles.metricValue}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  batteryText: {
    fontSize: 14,
    color: '#ff2ec4',
    marginRight: 10,
    fontWeight: 'bold',
  },
  screen: { flex: 1, backgroundColor: "#06060f" },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },

  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 16,
  },

  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  connectionText: {
    fontSize: 14,
    color: '#aaa',
    marginRight: 10,
  },

  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16161f',
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButtonText: {
    fontSize: 20,
    color: '#ff2ec4',
    fontWeight: '600',
  },

  topCard: {
    position: "relative",
    alignSelf: "center",
    backgroundColor: "#06060f",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#2b3240",
    opacity: 0.9,
    alignSelf: "center",
    marginBottom: 10,
  },

  // ring
  ringWrap: { alignItems: "center", justifyContent: "center" },
  ringCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  stepsValue: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  stepsLabel: { fontSize: 16, color: "#aaa", marginTop: 4 },

  // rows
  rowCard: {
    backgroundColor: "#16161f",
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // remove marginBottom if you use rowGap
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // allows long titles without pushing value off-screen
  },
  rowIcon: { width: 24, height: 24, marginRight: 10, tintColor: "#ff2ec4" },

  metricTitle: { fontSize: 16, color: "#fff" },       // left label
  metricValue: { fontSize: 18, fontWeight: "bold", color: "#fff" }, // right value
});
