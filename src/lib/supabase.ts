import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Не задано EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
      "Створіть файл .env у корені проєкту (див. .env.example) і перезапустіть `npx expo start -c`."
  );
}

// Під час серверного рендерингу (Expo Router web) немає window/localStorage —
// підставляємо «порожнє» сховище, щоб імпорт не падав.
const isServer = typeof window === "undefined";
const storage = isServer
  ? {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    }
  : AsyncStorage;

export const supabase = createClient(url, anonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // Токени з посилань (підтвердження пошти, Google) обробляємо самі в AuthContext
    detectSessionInUrl: false,
  },
});

// На мобільних оновлюємо токен лише коли застосунок активний
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
