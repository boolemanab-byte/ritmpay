import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { PaymentStatus } from "@/lib/types";

const CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    box: string;
    text: string;
    color: string;
  }
> = {
  paid: {
    label: t.status.paid,
    icon: "checkmark-circle",
    box: "bg-sky-400/15 border-sky-400/30",
    text: "text-sky-300",
    color: colors.sky[300],
  },
  pending: {
    label: t.status.pending,
    icon: "time",
    box: "bg-gold-400/15 border-gold-400/30",
    text: "text-gold-300",
    color: colors.gold[300],
  },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const c = CONFIG[status];
  return (
    <View
      className={`flex-row items-center rounded-full border px-3 py-1.5 ${c.box}`}
    >
      <Ionicons name={c.icon} size={13} color={c.color} />
      <Text className={`ml-1.5 text-xs font-semibold ${c.text}`}>{c.label}</Text>
    </View>
  );
}
