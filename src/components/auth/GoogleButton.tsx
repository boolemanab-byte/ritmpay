import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/** Роздільник «або» між основною кнопкою та входом через Google. */
export function OrDivider() {
  return (
    <View className="my-5 flex-row items-center">
      <View className="h-px flex-1 bg-white/10" />
      <Text className="mx-3 text-xs uppercase tracking-widest text-mist-500">
        {t.auth.or}
      </Text>
      <View className="h-px flex-1 bg-white/10" />
    </View>
  );
}

export function GoogleButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="h-14 flex-row items-center justify-center rounded-2xl border border-white/15 bg-white/5 active:bg-white/10"
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      {loading ? (
        <ActivityIndicator color={colors.mist[100]} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={colors.mist[100]} />
          <Text className="ml-3 text-base font-medium text-mist-100">
            {t.auth.google}
          </Text>
        </>
      )}
    </Pressable>
  );
}
