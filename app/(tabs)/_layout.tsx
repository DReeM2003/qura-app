import { Tabs } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import ProfileSidebar from "../components/profilesidebar";



const ICON = {
  home: require("../../assets/icons/home.png"),
  ekg: require("../../assets/icons/ekg.png"),
  metrics: require("../../assets/icons/metrics.png"),
  settings: require("../../assets/icons/settings.png"),
  profile: require("../../assets/icons/profile.png"),
  notifications: require("../../assets/icons/notifications.png"),
};


function BubbleIcon({ focused, src, tint, iconSize = 24, bubbleSize = 44 }) {
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(focused ? 1 : 0, { duration: 160 }) }],
    opacity: withTiming(focused ? 1 : 0, { duration: 140 }),
  }));

  const box = bubbleSize + 12; // padding around the bubble

  return (
    <View style={{ width: box, height: box, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -15,
            width: bubbleSize,
            height: bubbleSize,
            borderRadius: bubbleSize / 2,
            backgroundColor: "#fff",
          },
          aStyle,
        ]}
      />
      <Image
        source={src}
        style={{ width: iconSize, height: iconSize, tintColor: tint }}
        resizeMode="contain"
      />
    </View>
  );
}


export default function Layout() {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#06060f" },
          headerTintColor: "#fff",
          sceneContainerStyle: { backgroundColor: "#06060f" },

          headerLeft: () => (
              <Pressable onPress={() => setProfileOpen(true)} style={{ marginLeft: 16 }} hitSlop={12}>
              <Image
                source={ICON.profile}
                style={{ width: 40, height: 40, borderRadius: 16, tintColor: "#fff" }}
              />
            </Pressable>
          ),

          headerRight: () => (
              <Pressable onPress={() => setNotificationOpen(true)} style={{ marginRight: 16 }} hitSlop={12}>
              <Image
                source={ICON.notifications}
                style={{ width: 26, height: 26, tintColor: "#fff" }}
              />
              {/* optional red dot */}
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#ff2ec4",
                }}
              />
            </Pressable>
          ),

          tabBarShowLabel: false,
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#777",

        tabBarStyle: {
          position: "absolute",
          bottom: 20, // spacing from screen edge
          marginHorizontal: 16,
          backgroundColor: "#16161fff", // container color
          borderRadius: 28,
          height: 70,
          borderTopWidth: 0,
          ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 16,
              },
              android: { 
                elevation: 8 
              },
            }),
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarIconStyle: {
          marginTop: 13,   // adjust vertical position
        },

        
      }}
  >
      <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color }) => (
              <BubbleIcon
                focused={focused}
                src={ICON.home}
                tint={color}
                iconSize={55}
                bubbleSize={4}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ekg"
          options={{
            title: "EKG",
            tabBarIcon: ({ focused, color }) => (
              <BubbleIcon
                focused={focused}
                src={ICON.ekg}
                tint={color}
                iconSize={45}
                bubbleSize={4}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="metrics"
          options={{
            title: "Metrics",
            tabBarIcon: ({ focused, color }) => (
              <BubbleIcon
                focused={focused}
                src={ICON.metrics}
                tint={color}
                iconSize={34}
                bubbleSize={4}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color }) => (
              <BubbleIcon
                focused={focused}
                src={ICON.settings}
                tint={color}
                iconSize={32}
                bubbleSize={4}
              />
            ),
          }}
        />
      </Tabs>

      <ProfileSidebar open={profileOpen} onClose={() => setProfileOpen(false)} />
      {/* <NotificationSidebar open={notificationOpen} onClose={() => setNotificationOpen(false)} /> */}
  </>        
  );
}
