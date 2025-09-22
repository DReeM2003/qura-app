// app/(tabs)/settings.tsx
import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SettingsOption =
{
  id: number;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

const SETTINGS_OPTIONS: SettingsOption[] =
 [
  { id: 1, title: "Account", subtitle: "Privacy, security, change number" },
  { id: 2, title: "Chats", subtitle: "Chat history, app shortcuts" },
  { id: 3, title: "Notifications", subtitle: "Message, calendar" },
  { id: 4, title: "Storage and data", subtitle: "Network usage, auto-download" },
  { id: 5, title: "Appearance", subtitle: "Themes" },
  { id: 6, title: "Help", subtitle: "FAQ, contact us, terms and conditions" },
];

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Options list */}
        <View style={styles.sectionContainer}>
          {SETTINGS_OPTIONS.map((opt) => (
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
    paddingVertical: 8,
    marginBottom: 16,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2b2f3a",
  },

  itemTitle: { fontSize: 16, color: "#ffffff" },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2b2f3a",
  },
  optionTitle: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  optionSubtitle: { fontSize: 13, color: "#9aa0a6", marginTop: 2 },
  chevron: { color: "#9aa0a6", fontSize: 22, paddingLeft: 10 },
});
