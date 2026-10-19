import "../../global.css";

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  // Optional: load a clean sans-serif (e.g. Inter via @expo-google-fonts/inter)
  // with useFonts() here and keep the splash screen up until it's ready.
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.ink[900] },
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
