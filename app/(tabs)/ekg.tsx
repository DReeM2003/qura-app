import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line, Polyline, Rect } from "react-native-svg";

const SAMPLE_RATE_HZ = 250; // Typical ECG sample rate
const BUFFER_SECONDS = 8; // Width of displayed rolling window
const PLOT_HEIGHT = 220;
const PLOT_WIDTH = 360;
const MAX_SAMPLES = SAMPLE_RATE_HZ * BUFFER_SECONDS;

type DetectorState = {
  // state for peak detection
  lastPeakTs: number | null;
  rrMs: number[]; // recent RR intervals (ms)
  bpm: number | null;
  refractoryMs: number; // minimum ms between peaks
  threshold: number; // adaptive threshold
};

function useECG() {
  // custom hook to manage ECG data and detection
  const [running, setRunning] = useState(false);
  const [bpm, setBpm] = useState<number | null>(null); // beats per minute
  const bufferRef = useRef<number[]>([]);
  const [tick, setTick] = useState(0); // just to trigger re-render of chart
  const detector = useRef<DetectorState>({
    lastPeakTs: null,
    rrMs: [],
    bpm: null,
    refractoryMs: 240,
    threshold: 0.02,
  });

  // Simple rolling means for DC removal and smoothing
  const dcWindow: number[] = [];
  const energyWindow: number[] = [];

  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const startTsRef = useRef<number | null>(null);

  function nowMs() {
    return startTsRef.current ? Date.now() - startTsRef.current : 0;
  }

  // --- Replace this with your BLE stream value (in millivolts-ish) ---
  function generateSyntheticSample(t: number): number {
    // Synthetic ECG: baseline + QRS spikes + a little noise
    // t in seconds
    const heartRate = 72; // bpm
    const rr = 60 / heartRate; // seconds
    const phase = (t % rr) / rr;

    // Simple spike around phase ~0 (QRS), tiny P & T bumps
    let amp = 0.0;
    // P-wave ~0.15
    amp += 0.07 * Math.exp(-Math.pow((phase - 0.15) / 0.03, 2));
    // QRS complex near 0
    amp += 1.2 * Math.exp(-Math.pow((phase - 0.0) / 0.015, 2));
    // T-wave ~0.45
    amp += 0.25 * Math.exp(-Math.pow((phase - 0.45) / 0.05, 2));
    // Add light noise
    amp += 0.03 * (Math.random() * 2 - 1);
    return amp; // unitless "mV-like"
  }

  function pushSample(sample: number) {
    const buf = bufferRef.current;
    if (buf.length >= MAX_SAMPLES) buf.shift();
    buf.push(sample);
  }

  // DC removal via moving mean (short window)
  function dcRemove(x: number, w: number[] = dcWindow, n: number = 35) {
    w.push(x);
    if (w.length > n) w.shift();
    const mean = w.reduce((a, b) => a + b, 0) / w.length;
    return x - mean;
  }

  // Energy signal via rectification then moving average
  function shortMAEnergy(
    x: number,
    w: number[] = energyWindow,
    n: number = 12
  ) {
    const rect = Math.abs(x);
    w.push(rect);
    if (w.length > n) w.shift();
    return w.reduce((a, b) => a + b, 0) / w.length;
  }

  function detectPeaks(energy: number) {
    const d = detector.current;
    // Slowly adapt threshold toward energy (EMA-like)
    const alpha = 0.005;
    d.threshold = (1 - alpha) * d.threshold + alpha * energy;

    const t = nowMs();

    const canPeak = d.lastPeakTs === null || t - d.lastPeakTs > d.refractoryMs;

    // Peak if energy exceeds (threshold * factor)
    const factor = 2.8;
    if (canPeak && energy > d.threshold * factor) {
      // R-peak detected
      if (d.lastPeakTs !== null) {
        const rr = t - d.lastPeakTs; // ms
        d.rrMs.push(rr);
        if (d.rrMs.length > 8) d.rrMs.shift();

        // Use median RR for stability
        const sorted = [...d.rrMs].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median =
          sorted.length % 2 === 0
            ? 0.5 * (sorted[mid - 1] + sorted[mid])
            : sorted[mid];

        const bpmVal = 60000 / median;
        d.bpm = Math.max(30, Math.min(220, bpmVal)); // clamp to plausible range
        setBpm(parseFloat(d.bpm.toFixed(0)));
      }
      d.lastPeakTs = t;
      // brief bump threshold up (dynamic)
      d.threshold *= 1.1;
    }
  }

  function start() {
    if (running) return;
    setRunning(true);
    bufferRef.current = [];
    detector.current = {
      lastPeakTs: null,
      rrMs: [],
      bpm: null,
      refractoryMs: 240,
      threshold: 0.02,
    };
    startTsRef.current = Date.now();
    let sampleIndex = 0;

    intervalRef.current = setInterval(() => {
      // Emit several samples per tick to keep timing smooth
      const batch = 5;
      for (let i = 0; i < batch; i++) {
        const tSec = sampleIndex / SAMPLE_RATE_HZ;
        const raw = generateSyntheticSample(tSec);
        const highPass = dcRemove(raw);
        const energy = shortMAEnergy(highPass);
        detectPeaks(energy);
        pushSample(highPass);
        sampleIndex++;
      }
      setTick((x) => x + 1);
    }, (1000 / SAMPLE_RATE_HZ) * 5);
  }

  function stop() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    running,
    start,
    stop,
    bpm,
    samples: bufferRef.current,
  };
}

/*ECG Chart (SVG Polyline)*/
function ECGChart({
  samples,
  width = PLOT_WIDTH,
  height = PLOT_HEIGHT,
}: {
  samples: number[];
  width?: number;
  height?: number;
}) {
  const path = useMemo(() => {
    if (samples.length === 0) return "";
    // Normalize amplitude to plot height
    const maxAbs = Math.max(0.2, ...samples.map((v) => Math.abs(v)));
    const midY = height / 2;

    const stepX = width / Math.max(1, MAX_SAMPLES);
    const start = Math.max(0, samples.length - MAX_SAMPLES);

    let d = "";
    for (let i = start; i < samples.length; i++) {
      const x = Math.round((i - start) * stepX);
      const y = Math.round(midY - (samples[i] / maxAbs) * (height * 0.45));
      d += `${x},${y} `;
    }
    return d.trim();
  }, [samples, width, height]);

  //heart rate chart background and grid
  return (
    <Svg width={width} height={height}>
      {/* background */}
      <Rect x={0} y={0} width={width} height={height} fill="#0B0B0F" />
      {/* grid (light) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = Math.round((i + 1) * (height / 9));
        return (
          <Line
            key={`h-${i}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="#1f2430"
            strokeWidth={1}
          />
        );
      })}
      {Array.from({ length: 11 }).map((_, i) => {
        // 11 vertical lines
        const x = Math.round((i + 1) * (width / 12));
        return (
          <Line
            key={`v-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke="#1f2430"
            strokeWidth={1}
          />
        );
      })}

      {/* waveform */}
      <Polyline
        points={path}
        stroke="#e342bb" // pinkish
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

/* EKG Tab Screen */
export default function EKGTab() {
  const { running, start, stop, bpm, samples } = useECG();
  const [bpmHistory, setBpmHistory] = useState<number[]>([]);

  useEffect(() => {
    if (bpm) {
      setBpmHistory((prev) => [bpm, ...prev].slice(0, 200)); // keep last 30 readings
    }
  }, [bpm]);

  const maxBpm = bpmHistory.length > 0 ? Math.max(...bpmHistory) : "--";
  const minBpm = bpmHistory.length > 0 ? Math.min(...bpmHistory) : "--";
  const avgBpm =
    bpmHistory.length > 0
      ? Math.round(
          bpmHistory.reduce((a, b) => a + b, 0) / bpmHistory.length
        ).toFixed(0)
      : "--";

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}> Heart Rate</Text>

      {/* ECG Waveform */}
      <View style={styles.card}>
        <ECGChart samples={samples} />
      </View>

      {/* --- Move Buttons Here --- */}
      <View style={styles.buttonsRow}>
        {!running ? (
          <TouchableOpacity
            onPress={start}
            style={[styles.btn, styles.btnPrimary]}
          >
            <Text style={styles.btnText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={stop}
            style={[styles.btn, styles.btnDanger]}
          >
            <Text style={styles.btnText}>Stop</Text>
          </TouchableOpacity>
        )}

        {/* <TouchableOpacity
          onPress={() => {
            console.log("Connect Band pressed — integrate BLE logic here");
          }}
          style={[styles.btn, styles.btnOutline]}
        >
          <Text style={styles.btnText}>Connect Band</Text>
        </TouchableOpacity> */}
      </View>

      {/* Heart rate metrics below */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Heart Rate</Text>
          <Text style={styles.metricValue}>
            {bpm ? `${bpm}` : "--"} <Text style={styles.metricUnit}>bpm</Text>
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Status</Text>
          <Text style={[styles.metricValue, { fontSize: 18 }]}>
            {running ? "Streaming" : "Idle"}
          </Text>
        </View>
      </View>
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Heart Rates of the Day</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Max</Text>
            <Text style={styles.summaryValue}>
              {maxBpm} <Text style={styles.metricUnit}>bpm</Text>
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Resting</Text>
            <Text style={styles.summaryValue}>
              {minBpm} <Text style={styles.metricUnit}>bpm</Text>
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Average</Text>
            <Text style={styles.summaryValue}>
              {avgBpm} <Text style={styles.metricUnit}>bpm</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* {
        <Text style={styles.hint}>
          Tip: Press "Connect Band" to pair with your ECG device via Bluetooth.
        </Text>
      } */}
    </SafeAreaView>
  );
}

/* Colors and dimensions (user interface)*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F", // dark background
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    color: "#E7E8EB", // off white
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0F1220", // slightly lighter dark
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#23283a", // subtle border
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#0F1220", // slightly lighter dark
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#23283a", // subtle border
    padding: 12,
  },
  metricLabel: {
    color: "#9aa3b2",
    fontSize: 13,
  },
  metricValue: {
    color: "#E7E8EB", // off white
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },
  metricUnit: {
    color: "#9aa3b2", // off white but lighter
    fontSize: 14,
    fontWeight: "500",
  },
  buttonsRow: {
    // row of buttons
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  btn: {
    // button base style
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: "#e342bb", // pinkish
  },
  btnDanger: {
    backgroundColor: "#ef4444", // red
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#3a4157", // subtle border
    backgroundColor: "transparent",
  },
  btnText: {
    color: "#E7E8EB", // off white
    fontWeight: "600",
  },
  hint: {
    color: "#7f8897", //  muted gray
    fontSize: 12,
    marginTop: 12,
  },

  summarySection: {
    marginTop: 18,
    backgroundColor: "#0F1220", // slightly lighter dark
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#23283a", // subtle border
  },
  summaryTitle: {
    color: "#E7E8EB", // off white
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between", // evenly space
  },
  summaryBox: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    color: "#9aa3b2", // muted gray
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: "#E7E8EB", // off white
    fontSize: 22,
    fontWeight: "700",
  },
});
