import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { colors } from "@/lib/theme";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "blue" | "gold";
}

const GRADIENTS = {
  blue: [colors.sky[300], colors.sky[500]],
  gold: [colors.gold[300], colors.gold[500]],
} as const;

export function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "blue",
}: Props) {
  const glow = variant === "gold" ? colors.gold[400] : colors.sky[400];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      className="active:opacity-80"
      style={{
        opacity: disabled ? 0.45 : 1,
        shadowColor: glow, // subtle glow
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16 }}
      >
        <View className="h-14 items-center justify-center">
          {loading ? (
            <ActivityIndicator color={colors.ink[900]} />
          ) : (
            <Text className="text-base font-semibold text-ink-900">
              {title}
            </Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
