import { Redirect, Stack } from "expo-router";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingScreen />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
