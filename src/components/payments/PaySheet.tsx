import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/ui/GradientButton";
import { formatDate, formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { monthYearLabel, payPlan } from "@/lib/schedule";
import { todayIso } from "@/lib/dates";
import { colors } from "@/lib/theme";
import type { Payment } from "@/lib/types";

interface Props {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  /** periods — скільки періодів оплачується (1 = лише найближчий) */
  onConfirm: (paymentId: string, periods: number) => void;
}

/**
 * Вибір місяця (періоду) оплати. За замовчуванням — поточний місяць,
 * далі можна обрати пізніший (оплата наперед) або раніший (частина боргу).
 * Оплачуються всі періоди від найстарішого неоплаченого до обраного.
 */
export function PaySheet({ visible, payment, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const today = todayIso();

  const plan = useMemo(() => (payment ? payPlan(payment, today) : null), [payment, today]);
  const [index, setIndex] = useState(0);

  // Щоразу, коли шторка відкривається, повертаємо вибір на значення за замовчуванням
  useEffect(() => {
    if (visible && plan) setIndex(plan.defaultIndex);
  }, [visible, plan]);

  if (!payment || !plan) return null;

  const periods = index + 1;
  const total = payment.amount * periods;
  const chosen = plan.options[index];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />

        <View
          className="w-full max-w-xl self-center rounded-t-[32px] border border-b-0 border-white/10 bg-ink-800 px-6 pt-3"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-white/20" />

          <Text className="text-xl font-semibold text-mist-100" numberOfLines={1}>
            {t.pay.title} · {payment.title}
          </Text>
          <Text className="mb-3 mt-1 text-sm text-mist-300">{t.pay.pickMonth}</Text>

          <ScrollView
            style={{ maxHeight: 300 }}
            showsVerticalScrollIndicator={false}
            className="mb-4"
          >
            {plan.options.map((o, i) => {
              const included = i <= index;
              return (
                <Pressable
                  key={o.due}
                  onPress={() => setIndex(i)}
                  className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${
                    i === index
                      ? "border-sky-400/60 bg-sky-400/15"
                      : included
                        ? "border-sky-400/25 bg-sky-400/5"
                        : "border-white/10 bg-white/5 active:bg-white/10"
                  }`}
                >
                  <Ionicons
                    name={included ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={included ? colors.sky[300] : colors.mist[500]}
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-mist-100">
                      {monthYearLabel(o.due)}
                    </Text>
                    <Text className="text-xs text-mist-500">
                      {t.card.dueOn(formatDate(o.due))}
                    </Text>
                  </View>
                  {o.overdue ? (
                    <Text className="text-xs font-semibold text-red-300">{t.pay.debtTag}</Text>
                  ) : o.current ? (
                    <Text className="text-xs font-semibold text-gold-300">
                      {t.pay.currentTag}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mb-4 rounded-2xl border border-gold-400/25 bg-gold-400/10 p-4">
            {periods > 1 ? (
              <View className="mb-1 flex-row justify-between">
                <Text className="text-sm text-mist-300">{t.pay.periods}</Text>
                <Text className="text-sm text-mist-100">
                  {periods} × {formatMoney(payment.amount)}
                </Text>
              </View>
            ) : null}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gold-300">{t.pay.total}</Text>
              <Text className="text-2xl font-bold text-gold-300">{formatMoney(total)}</Text>
            </View>
            <Text className="mt-1 text-xs text-mist-500">
              {t.pay.payUntil(monthYearLabel(chosen.due))}
            </Text>
            {payment.requiresReadings && periods > 1 ? (
              <Text className="mt-2 text-xs text-mist-300">{t.pay.estimate}</Text>
            ) : null}
          </View>

          <GradientButton
            title={t.pay.confirm}
            onPress={() => {
              onConfirm(payment.id, periods);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
