// app/(tabs)/metrics.tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICON = {
  steps: require("../../assets/icons/steps.png"),
  heart: require("../../assets/icons/heart.png"),
  resp: require("../../assets/icons/resp_rate.png"),
  spo2: require("../../assets/icons/blood_oxygen.png"),
  temp: require("../../assets/icons/temp.png"),
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WEEKDAYS = ["S","M","T","W","T","F","S"];

export default function Metrics() {
  const { width, height } = Dimensions.get("window");
  const H = 16;                 // horizontal page padding
  const tabBarHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  const bottomClearance = tabBarHeight + bottom + 25;

  // --- Calendar state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11
  const [selected, setSelected] = useState<Date | null>(today);

  // compute grid cells (42 cells = 6 weeks)
  const daysGrid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { key: string; date: Date; inMonth: boolean }[] = [];
    // leading days from prev month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysPrevMonth - i);
      cells.push({ key: `p-${d.toDateString()}`, date: d, inMonth: false });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(viewYear, viewMonth, d);
      cells.push({ key: `c-${dt.toDateString()}`, date: dt, inMonth: true });
    }
    // trailing days from next month to fill 42
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      cells.push({ key: `n-${next.toDateString()}`, date: next, inMonth: false });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // --- Metrics data (replace with your live data)
  const metrics = [
    { key: "steps", label: "Steps", value: "8,540", icon: ICON.steps },
    { key: "hr",    label: "Heart Rate", value: "72 bpm", icon: ICON.heart },
    { key: "resp",  label: "Respiratory Rate", value: "15 br/m", icon: ICON.resp },
    { key: "spo2",  label: "Blood Oxygen", value: "97%", icon: ICON.spo2 },
    { key: "temp",  label: "Body Temp.", value: "97.6°F", icon: ICON.temp },
  ];

  // layout sizes
  const calendarHeight = Math.max(280, Math.floor(height * 0.45)); // “top half”
  const contentWidth = width - H * 2;
  const ROW_HEIGHT = 84;

  return (
    <View style={styles.screen}>
      {/* Top: Calendar */}
      <View style={[styles.calendarWrap, { height: calendarHeight, paddingHorizontal: H }]}>
        {/* Header with month/year and chevrons */}
        <View style={styles.calHeader}>
          <Pressable onPress={goPrevMonth} hitSlop={10}>
            <Text style={styles.chev}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <Pressable onPress={goNextMonth} hitSlop={10}>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekHeader}>
          {WEEKDAYS.map(d => (
            <Text key={d} style={styles.weekLabel}>{d}</Text>
          ))}
        </View>

        {/* 6×7 grid */}
        <View style={styles.daysGrid}>
          {daysGrid.map(({ key, date, inMonth }) => {
            const isSelected =
              selected &&
              date.getFullYear() === selected.getFullYear() &&
              date.getMonth() === selected.getMonth() &&
              date.getDate() === selected.getDate();

            return (
              <Pressable
                key={key}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => setSelected(date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !inMonth && styles.dayOut,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Bottom: Metrics list (scrollable) */}
      <FlatList
        data={metrics}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingHorizontal: H,
          paddingBottom: bottomClearance,
          rowGap: 12,
        }}
        renderItem={({ item }) => (
          <View style={[styles.rowCard, { width: contentWidth, height: ROW_HEIGHT }]}>
            <View style={styles.rowLeft}>
              <Image source={item.icon} style={styles.rowIcon} />
              <Text style={styles.metricTitle}>{item.label}</Text>
            </View>
            <Text style={styles.metricValue}>{item.value}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: bottomClearance }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#06060f" },

  // Calendar
  calendarWrap: {
    paddingTop: 12,
    backgroundColor: "#0c0c14",
  },
  calHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chev: { color: "#fff", fontSize: 28, paddingHorizontal: 4 },
  monthTitle: { color: "#ff2ec4", fontSize: 18, fontWeight: "700" },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  weekLabel: { color: "#9aa0a6", width: `${100 / 7}%`, textAlign: "center" },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 0,
    rowGap: 6,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: "#171726",
    borderWidth: 1,
    borderColor: "#ff2ec4",
  },
  dayText: { color: "#e4e6eb", fontSize: 15 },
  dayOut: { color: "#637087" },
  dayTextSelected: { color: "#fff", fontWeight: "700" },

  // Rows
  rowCard: {
    backgroundColor: "#16161f",
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  rowIcon: { width: 24, height: 24, marginRight: 10, tintColor: "#fff" },
  metricTitle: { fontSize: 16, color: "#fff" },
  metricValue: { fontSize: 18, fontWeight: "bold", color: "#ff2ec4" },
});
