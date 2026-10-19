import { Text, View } from "react-native";

interface Props {
  label: string;
  value: string;
  /** Обмежити кількість рядків (для компактної картки) */
  lines?: number;
  highlight?: boolean;
  /** За замовчуванням текст можна копіювати; на картці вимкнено, щоб не заважати тапу */
  selectable?: boolean;
}

/** Рядок «підпис — значення». Значення можна виділити й скопіювати. */
export function InfoRow({ label, value, lines, highlight, selectable = true }: Props) {
  return (
    <View className="mb-3">
      <Text className="text-[11px] uppercase tracking-widest text-mist-500">{label}</Text>
      <Text
        selectable={selectable}
        numberOfLines={lines}
        className={`mt-0.5 text-base ${highlight ? "text-gold-300" : "text-mist-100"}`}
      >
        {value}
      </Text>
    </View>
  );
}
