import { Pressable, Text } from "react-native";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Невеликий перемикач-«таблетка» для вибору категорії чи періодичності. */
export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 mr-2 rounded-full border px-4 py-2.5 ${
        selected
          ? "border-sky-400/70 bg-sky-400/20"
          : "border-white/10 bg-white/5 active:bg-white/10"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? "text-sky-300" : "text-mist-300"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
