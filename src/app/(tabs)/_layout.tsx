import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { t } from "@/lib/i18n";
import { TAB_BAR_HEIGHT } from "@/lib/layout";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  const { user, initializing } = useAuth();
  const insets = useSafeAreaInsets();
  if (initializing) return <LoadingScreen />;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ink[900] },
        tabBarActiveTintColor: colors.sky[300],
        tabBarInactiveTintColor: colors.mist[500],
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        // Плаваючий скляний таб-бар
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
          title: t.tabs.payments,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t.tabs.history,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
