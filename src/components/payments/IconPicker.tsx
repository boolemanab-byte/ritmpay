import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { CUSTOM_ICONS, type IconName } from "@/lib/categories";
import { colors } from "@/lib/theme";

interface Props {
  value: IconName;
  onChange: (icon: IconName) => void;
}

/** Сітка значків для власної підкатегорії в «Іншому». */
export function IconPicker({ value, onChange }: Props) {
  return (
    <View className="mb-4 flex-row flex-wrap">
      {CUSTOM_ICONS.map((icon) => {
        const selected = icon === value;
        return (
          <Pressable
            key={icon}
            onPress={() => onChange(icon)}
            accessibilityLabel={icon}
            className={`mb-2 mr-2 h-12 w-12 items-center justify-center rounded-2xl border ${
              selected
                ? "border-sky-400/70 bg-sky-400/20"
                : "border-white/10 bg-white/5 active:bg-white/10"
            }`}
          >
            <Ionicons
              name={icon}
              size={22}
              color={selected ? colors.sky[300] : colors.mist[300]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
