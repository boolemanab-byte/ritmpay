import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { paymentIcon, subcategoryLabel } from "@/lib/categories";
import { todayIso } from "@/lib/dates";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentInfoRows } from "@/lib/paymentInfo";
import { isOverdue } from "@/lib/schedule";
import { InfoRow } from "@/components/payments/InfoRow";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { Payment } from "@/lib/types";

function DateBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gold" | "red";
}) {
  const color = tone === "red" ? "text-red-300" : tone === "gold" ? "text-gold-300" : "text-mist-100";
  return (
    <View className="flex-1">
      <Text className="text-[11px] uppercase tracking-widest text-mist-500">{label}</Text>
      <Text className={`mt-1 text-base font-medium ${color}`}>{value}</Text>
    </View>
  );
}

interface Props {
  payment: Payment;
  expanded: boolean;
  onToggle: (payment: Payment) => void;
  onEnterReadings: (payment: Payment) => void;
  onPay: (payment: Payment) => void;
  onOpenMenu: (payment: Payment) => void;
  onOpen: (payment: Payment) => void;
}

export function PaymentCard({
  payment,
  expanded,
  onToggle,
  onEnterReadings,
  onPay,
  onOpenMenu,
  onOpen,
}: Props) {
  const isPaid = payment.status === "paid";
  const overdue = isOverdue(payment, todayIso());
  const info = expanded ? paymentInfoRows(payment) : [];

  const statusLabel = overdue ? t.pay.debtTag : isPaid ? t.status.paid : t.status.pending;
  const statusColor = overdue ? "text-red-300" : isPaid ? "text-sky-300" : "text-gold-300";
  const iconColor = overdue ? "#FCA5A5" : isPaid ? colors.sky[300] : colors.gold[300];

  return (
    <GlassCard className={overdue ? "border-red-400/30" : ""}>
      {/* Згорнутий рядок — завжди видно */}
      <Pressable
        onPress={() => onToggle(payment)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? t.card.collapse : t.card.expand}
        accessibilityState={{ expanded }}
        className="flex-row items-center px-4 py-3 active:bg-white/5"
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          <Ionicons name={paymentIcon(payment)} size={20} color={iconColor} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-mist-100" numberOfLines={1}>
            {payment.title}
          </Text>
          <Text
            className={`text-xs ${overdue ? "text-red-300" : "text-mist-500"}`}
            numberOfLines={1}
          >
            {overdue
              ? t.card.overdueSince(formatDate(payment.nextPaymentDate))
              : t.card.dueOn(formatDate(payment.nextPaymentDate))}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-semibold text-mist-100">
            {formatMoney(payment.amount)}
          </Text>
          <Text className={`text-xs font-medium ${statusColor}`}>{statusLabel}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mist[500]}
          style={{ marginLeft: 10 }}
        />
      </Pressable>

      {/* Розгорнуті деталі */}
      {expanded ? (
        <View className="border-t border-white/10 px-4 pb-4 pt-4">
          <Text className="mb-3 text-xs text-mist-500" numberOfLines={1}>
            {subcategoryLabel(payment)}
          </Text>

          <View className="flex-row">
            <DateBlock label={t.card.previous} value={formatDate(payment.previousPaymentDate)} />
            <DateBlock
              label={t.card.next}
              value={formatDate(payment.nextPaymentDate)}
              tone={overdue ? "red" : isPaid ? undefined : "gold"}
            />
          </View>

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

          <Pressable
            onPress={() => onPay(payment)}
            className={`mt-3 h-11 flex-row items-center justify-center rounded-xl border active:bg-sky-400/20 ${
              isPaid ? "border-white/15 bg-white/5" : "border-sky-400/40 bg-sky-400/10"
            }`}
          >
            <Ionicons
              name={isPaid ? "play-forward-circle-outline" : "checkmark-circle-outline"}
              size={16}
              color={colors.sky[300]}
            />
            <Text className="ml-2 text-sm font-semibold text-sky-300">
              {isPaid ? t.card.payAhead : t.card.markPaid}
            </Text>
          </Pressable>

          <View className="mt-3 flex-row items-center justify-between">
            <Pressable
              onPress={() => onOpen(payment)}
              hitSlop={8}
              className="flex-row items-center py-1 active:opacity-70"
            >
              <Text className="text-sm font-medium text-mist-300">{t.card.details}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.mist[300]} />
            </Pressable>
            <Pressable
              onPress={() => onOpenMenu(payment)}
              accessibilityLabel={t.card.menu}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-white/10"
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.mist[300]} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </GlassCard>
  );
}
