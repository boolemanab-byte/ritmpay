import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import { colors } from "@/lib/theme";

interface Props {
  onPress: () => void;
  /** Distance from the bottom of the screen (clear the tab bar) */
  bottom: number;
}

/** Futuristic FAB: gradient core, glass halo ring, soft colored glow. */
export function AddFab({ onPress, bottom }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Add payment"
      className="absolute right-5 active:scale-95"
      style={{ bottom }}
    >
      <View className="rounded-full border border-white/20 bg-white/10 p-1.5">
        <LinearGradient
          colors={[colors.sky[300], colors.gold[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: colors.sky[400],
            shadowOpacity: 0.6,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 6 },
            elevation: 10,
          }}
        >
          <Ionicons name="add" size={30} color={colors.ink[900]} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}
