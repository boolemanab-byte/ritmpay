import { ScrollView } from "react-native";
import { Chip } from "@/components/ui/Chip";

export interface FilterOption<K extends string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  options: FilterOption<K>[];
  value: K;
  onChange: (key: K) => void;
}

/** Горизонтальний ряд чіпів-фільтрів. */
export function FilterBar<K extends string>({ options, value, onChange }: Props<K>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // Негативні поля + padding, щоб чіпи доходили до краю екрана
      className="-mx-5"
      contentContainerClassName="px-5"
    >
      {options.map((o) => (
        <Chip
          key={o.key}
          label={o.label}
          selected={value === o.key}
          onPress={() => onChange(o.key)}
        />
      ))}
    </ScrollView>
  );
}
