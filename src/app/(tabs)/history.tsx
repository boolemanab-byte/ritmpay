import { Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { Screen } from "@/components/ui/Screen";

export default function HistoryScreen() {
  // TODO(Supabase): list past payments and readings, with charts of
  // monthly consumption per utility.
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6">
        <GlassCard className="w-full max-w-md items-center p-8">
          <Text className="text-xl font-semibold text-mist-100">History</Text>
          <Text className="mt-2 text-center text-sm text-mist-300">
            Payment history and consumption charts will appear here.
          </Text>
        </GlassCard>
      </View>
    </Screen>
  );
}
