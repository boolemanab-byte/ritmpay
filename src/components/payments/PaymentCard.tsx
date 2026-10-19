import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { paymentIcon, subcategoryLabel } from "@/lib/categories";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentInfoRows } from "@/lib/paymentInfo";
import { InfoRow } from "@/components/payments/InfoRow";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { Payment } from "@/lib/types";

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
  onMarkPaid: (payment: Payment) => void;
  onOpenMenu: (payment: Payment) => void;
  onOpen: (payment: Payment) => void;
}

export function PaymentCard({
  payment,
  onEnterReadings,
  onMarkPaid,
  onOpenMenu,
  onOpen,
}: Props) {
  const isPaid = payment.status === "paid";
  const info = paymentInfoRows(payment);

  return (
    <Pressable onPress={() => onOpen(payment)} className="active:opacity-90">
    <GlassCard className="p-5">
      {/* Шапка */}
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Ionicons
            name={paymentIcon(payment)}
            size={22}
            color={isPaid ? colors.sky[300] : colors.gold[300]}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold text-mist-100" numberOfLines={1}>
            {payment.title}
          </Text>
          <Text className="text-sm text-mist-300">
            {formatMoney(payment.amount)}
          </Text>
          <Text className="mt-0.5 text-xs text-mist-500" numberOfLines={1}>
            {subcategoryLabel(payment)}
          </Text>
        </View>
        <StatusBadge status={payment.status} />
        <Pressable
          onPress={() => onOpenMenu(payment)}
          accessibilityLabel={t.card.menu}
          hitSlop={8}
          className="ml-2 h-8 w-8 items-center justify-center rounded-full active:bg-white/10"
        >
          <Ionicons name="ellipsis-vertical" size={18} color={colors.mist[300]} />
        </Pressable>
      </View>

      <View className="my-4 h-px bg-white/10" />

      {/* Дати */}
      <View className="flex-row">
        <DateBlock
          label={t.card.previous}
          value={formatDate(payment.previousPaymentDate)}
        />
        <DateBlock
          label={t.card.next}
          value={formatDate(payment.nextPaymentDate)}
          highlight={!isPaid}
        />
      </View>

      {/* Усі дані, введені при створенні */}
      {info.length > 0 ? (
        <View className="mt-4 border-t border-white/10 pt-4">
          {info.map((r) => (
            <InfoRow
              key={r.key}
              label={r.label}
              value={r.value}
              selectable={false}
              lines={r.key === "bank" || r.key === "address" ? 2 : undefined}
            />
          ))}
        </View>
      ) : null}

      {/* Дії */}
      {payment.requiresReadings ? (
        <Pressable
          onPress={() => onEnterReadings(payment)}
          className="mt-4 h-11 flex-row items-center justify-center rounded-xl border border-gold-400/40 bg-gold-400/10 active:bg-gold-400/20"
        >
          <Ionicons name="speedometer-outline" size={16} color={colors.gold[300]} />
          <Text className="ml-2 text-sm font-semibold text-gold-300">
            {t.card.enterReadings}
          </Text>
        </Pressable>
      ) : null}

      {!isPaid ? (
        <Pressable
          onPress={() => onMarkPaid(payment)}
          className="mt-3 h-11 flex-row items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10 active:bg-sky-400/20"
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.sky[300]} />
          <Text className="ml-2 text-sm font-semibold text-sky-300">
            {t.card.markPaid}
          </Text>
        </Pressable>
      ) : null}
    </GlassCard>
    </Pressable>
  );
}
