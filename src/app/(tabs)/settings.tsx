import { Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6">
        <GlassCard className="w-full max-w-md p-6">
          <Text className="text-xl font-semibold text-mist-100">Account</Text>
          <Text className="mb-6 mt-1 text-sm text-mist-300">{user?.email}</Text>
          <GradientButton title="Sign out" onPress={signOut} />
        </GlassCard>
      </View>
    </Screen>
  );
}
