import { Redirect } from "expo-router";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingScreen />;
  return <Redirect href={user ? "/(tabs)" : "/login"} />;
}
