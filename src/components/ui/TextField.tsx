import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "@/lib/theme";

interface Props extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function TextField({ label, icon, secureTextEntry, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View className="mb-4">
      <Text className="mb-2 ml-1 text-xs font-medium uppercase tracking-widest text-mist-300">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border bg-white/5 px-4 ${
          focused ? "border-sky-400/70" : "border-white/10"
        }`}
      >
        <Ionicons
          name={icon}
          size={18}
          color={focused ? colors.sky[400] : colors.mist[300]}
        />
        <TextInput
          autoCapitalize="none"
          placeholderTextColor={colors.mist[500]}
          className="ml-3 flex-1 py-4 text-base text-mist-100"
          // Removes the default browser focus outline on web
          style={{ outlineWidth: 0 } as object}
          {...rest}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.mist[300]}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
