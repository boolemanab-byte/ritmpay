import { ActivityIndicator, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/lib/theme";

/** Повноекранний індикатор завантаження (відновлення сесії, перехід за посиланням). */
export function LoadingScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.sky[400]} />
      </View>
    </Screen>
  );
}
