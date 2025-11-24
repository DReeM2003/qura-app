import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Polyline, Rect } from "react-native-svg";
import { useBLEContext } from "../context/BLEContext";
import { useSensorData } from "../hooks/useSensorData";

export default function EKGScreen() {
  const { width } = Dimensions.get("window");
  const height = 260;

  const { lastMessage, simulationMode, connectedDevice } = useBLEContext();
  const { isConnected, requestUpdate } = useSensorData();

  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);

  function extractEcg(msg: string | null | undefined): number | null {
    if (!msg) return null;
    const trimmed = msg.trim();

    const direct = Number(trimmed);
    if (!isNaN(direct)) return direct;

    try {
      const json = JSON.parse(trimmed);
      if (typeof json.ecg === "number") return json.ecg;
    } catch {}

    // Case 3: CSV — ECG might be the last value
    const parts = trimmed.split(",");
    if (parts.length > 1) {
      const last = Number(parts[parts.length - 1]);
      if (!isNaN(last)) return last;
    }

    return null;
  }

  useEffect(() => {
    const ecgValue = extractEcg(lastMessage);

    // Only add numeric values
    if (typeof ecgValue !== "number" || Number.isNaN(ecgValue)) {
      return;
    }

    setPoints((prev) => {
      const next = [...prev, { x: prev.length, y: ecgValue }];
      return next.slice(-300); // keep last 300 points
    });
  }, [lastMessage]);

  const scaleY = (value: number) => {
    const min = 0;
    const max = 4000;
    return height - ((value - min) / (max - min)) * height;
  };

  const polylinePoints = points
    .map((p, i) => `${(i / 300) * width},${scaleY(p.y)}`)
    .join(" ");

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>ECG Monitor</Text>

        <View style={styles.connectionInfo}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#FF9800" },
            ]}
          />

          <Text style={styles.connectionText}>
            {isConnected
              ? simulationMode
                ? "Simulator Mode"
                : (connectedDevice?.name || connectedDevice?.id || "").slice(
                    0,
                    8
                  )
              : "Disconnected"}
          </Text>

          <Pressable onPress={requestUpdate} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>↻</Text>
          </Pressable>
        </View>
      </View>

      {/* EKG GRAPH */}
      <View style={{ marginTop: 20 }}>
        <Svg width={width} height={height}>
          {/* Background rectangle */}
          <Rect
            width={width}
            height={height}
            fill="none"
            stroke="#1a1a24"
            strokeWidth={1}
          />

          {/* Grid - vertical */}
          {[...Array(15)].map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={(width / 15) * i}
              y1={0}
              x2={(width / 15) * i}
              y2={height}
              stroke="#1e1e2a"
              strokeWidth={1}
            />
          ))}

          {/* Grid - horizontal */}
          {[...Array(8)].map((_, i) => (
            <Line
              key={`h-${i}`}
              x1={0}
              y1={(height / 8) * i}
              x2={width}
              y2={(height / 8) * i}
              stroke="#1e1e2a"
              strokeWidth={1}
            />
          ))}

          {/* ECG waveform */}
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke="#ff2ec4"
            strokeWidth="2"
          />
        </Svg>
      </View>

      <Text style={styles.label}>Real-time ECG Signal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#06060f",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  connectionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 14,
    color: "#aaa",
    marginRight: 10,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#16161f",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonText: {
    fontSize: 20,
    color: "#ff2ec4",
    fontWeight: "600",
  },
  label: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
});
