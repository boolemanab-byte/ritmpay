import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT } from "@/lib/layout";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ink[900] },
        tabBarActiveTintColor: colors.sky[300],
        tabBarInactiveTintColor: colors.mist[500],
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        // Floating glass tab bar
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          backgroundColor: "rgba(20,29,49,0.55)",
          elevation: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
        },
        tabBarBackground: () => (
          <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}