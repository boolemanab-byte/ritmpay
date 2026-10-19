import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";
import type { Payment, PaymentCategory } from "@/lib/types";

const CATEGORY_ICON: Record<PaymentCategory, keyof typeof Ionicons.glyphMap> = {
  gas: "flame-outline",
  water: "water-outline",
  electricity: "flash-outline",
  internet: "wifi-outline",
  rent: "home-outline",
  other: "receipt-outline",
};

function DateBlock({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-1">
      <Text className="text-[11px] uppercase tracking-widest text-mist-500">
        {label}
      </Text>
      <Text
        className={`mt-1 text-base font-medium ${
          highlight ? "text-gold-300" : "text-mist-100"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

interface Props {
  payment: Payment;
  onEnterReadings: (payment: Payment) => void;
}

export function PaymentCard({ payment, onEnterReadings }: Props) {
  const isPaid = payment.status === "paid";

  return (
    <GlassCard className="p-5">
      {/* Header */}
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Ionicons
            name={CATEGORY_ICON[payment.category]}
            size={22}
            color={isPaid ? colors.sky[300] : colors.gold[300]}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold text-mist-100">
            {payment.title}
          </Text>
          <Text className="text-sm text-mist-300">
            {formatMoney(payment.amount)}
          </Text>
        </View>
        <StatusBadge status={payment.status} />
      </View>

      <View className="my-4 h-px bg-white/10" />

      {/* Dates */}
      <View className="flex-row">
        <DateBlock
          label="Previous payment"
          value={formatDate(payment.previousPaymentDate)}
        />
        <DateBlock
          label="Next payment"
          value={formatDate(payment.nextPaymentDate)}
          highlight={!isPaid}
        />
      </View>

      {/* Utility-only action */}
      {payment.requiresReadings ? (
        <Pressable
          onPress={() => onEnterReadings(payment)}
          className="mt-4 h-11 flex-row items-center justify-center rounded-xl border border-gold-400/40 bg-gold-400/10 active:bg-gold-400/20"
        >
          <Ionicons name="speedometer-outline" size={16} color={colors.gold[300]} />
          <Text className="ml-2 text-sm font-semibold text-gold-300">
            Enter readings
          </Text>
        </Pressable>
      ) : null}
    </GlassCard>
  );
}
