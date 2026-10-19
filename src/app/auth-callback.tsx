import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";

/**
 * Сюди повертаються посилання підтвердження пошти та вхід через Google.
 * Саму сесію створює AuthContext; тут лише чекаємо й переходимо далі.
 */
export default function AuthCallbackScreen() {
  const { user } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(id);
  }, []);

  if (user) return <Redirect href="/(tabs)" />;
  if (timedOut) return <Redirect href="/login" />;
  return <LoadingScreen />;
}
