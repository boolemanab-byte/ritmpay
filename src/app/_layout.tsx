import "../../global.css";

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { PaymentsProvider } from "@/context/PaymentsContext";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  // Необов’язково: підключити чистий sans-serif (наприклад, Inter через
  // @expo-google-fonts/inter) з useFonts() і тримати splash, доки він не завантажиться.
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaymentsProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.ink[900] },
            }}
          >
            {/* Форма додавання/редагування платежу відкривається поверх табів */}
            <Stack.Screen
              name="payment-form"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            {/* Повна інформація про платіж */}
            <Stack.Screen name="payment-details" options={{ animation: "slide_from_right" }} />
          </Stack>
        </PaymentsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
