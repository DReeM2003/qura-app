// components/Notifications.tsx
import React, { useEffect } from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type Props = {
  open: boolean;
  onClose: () => void;
  name?: string;
  email?: string;
  age?: number;
  height_ft?: number;
  height_in?: number;
  weight?: number;
  avatarSrc?: any;
};

export default function NotificationTab({
  open,
  onClose,
  name = "Derek Anozie",
  email = "derek@example.com",
  avatarSrc,
}: Props) {
  const x = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    x.value = withTiming(open ? 0 : 1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [open]);

  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 320 }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(open ? 0.45 : 0, { duration: 180 }),
  }));

  return (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents={open ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Side sheet */}
      <Animated.View style={[styles.sheet, sheet]}>
        <View style={styles.header}>
          <Image
            source={avatarSrc ?? require("../../assets/icons/notifications.png")}
            style={styles.avatar}
          />

          <View style={{ marginLeft: 12, marginTop: 30}}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#000" },
  sheet: {
    position: "absolute",
    right: 0,
    top: 75,
    bottom: 75,
    width: Dimensions.get("window").width / 1.5,
    backgroundColor: "#16161fff",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 16,
  },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { color: "#fff", fontSize: 18, fontWeight: "700" },
  email: { color: "#9aa0a6", fontSize: 13, marginTop: 2 },
  meta: { color: "#c7c9d1", fontSize: 13, marginTop: 4 },
  section: {
    backgroundColor: "#16161f",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },

  label: { color: "#ff2ec4", fontSize: 12, marginBottom: 4 },
  value: { color: "#fff", fontSize: 16, fontWeight: "600" },
  editBtn: {
    marginTop: "auto",
    backgroundColor: "#ff2ec4",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  editText: { color: "#0a0a0f", fontWeight: "800", fontSize: 16 },
});
