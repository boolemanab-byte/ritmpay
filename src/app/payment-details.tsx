import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InfoRow } from "@/components/payments/InfoRow";
import { ReadingEditSheet } from "@/components/payments/ReadingEditSheet";
import { PaySheet } from "@/components/payments/PaySheet";
import { ReadingsSheet } from "@/components/payments/ReadingsSheet";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/context/PaymentsContext";
import { paymentIcon } from "@/lib/categories";
import { formatDate, formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { paymentInfoRows, paymentMetaRows } from "@/lib/paymentInfo";
import { colors } from "@/lib/theme";
import type { Payment, ReadingEntry } from "@/lib/types";

function Details({ payment }: { payment: Payment }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, readings, markPaid, submitReadings, editReading } = usePayments();

  const [readingsVisible, setReadingsVisible] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<ReadingEntry | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  const isPaid = payment.status === "paid";
  const meta = paymentMetaRows(payment);
  const info = paymentInfoRows(payment);

  // Історія показників цього платежу: від новіших до старіших
  const myReadings = useMemo(
    () =>
      readings
        .filter((r) => r.paymentId === payment.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [readings, payment.id]
  );
  const myEvents = useMemo(
    () => events.filter((e) => e.paymentId === payment.id),
    [events, payment.id]
  );

  // Верхня межа при редагуванні — значення наступного (новішого) запису
  const nextValueFor = (entry: ReadingEntry | null): number | null => {
    if (!entry) return null;
    const idx = myReadings.findIndex((r) => r.id === entry.id);
    return idx > 0 ? myReadings[idx - 1].value : null;
  };

  const openEdit = (entry: ReadingEntry) => {
    setEditEntry(entry);
    setEditVisible(true);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-xl self-center px-5"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16) + 8,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Шапка */}
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t.common.close}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 active:bg-white/10"
          >
            <Ionicons name="chevron-back" size={20} color={colors.mist[100]} />
          </Pressable>
          <Text className="text-lg font-semibold text-mist-100">{t.details.title}</Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/payment-form", params: { id: payment.id } })
            }
            accessibilityLabel={t.details.edit}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 active:bg-white/10"
          >
            <Ionicons name="create-outline" size={20} color={colors.sky[300]} />
          </Pressable>
        </View>

        {/* Головна картка */}
        <GlassCard className="p-5">
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Ionicons
                name={paymentIcon(payment)}
                size={26}
                color={isPaid ? colors.sky[300] : colors.gold[300]}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xl font-semibold text-mist-100" numberOfLines={2}>
                {payment.title}
              </Text>
              <View className="mt-1.5 self-start">
                <StatusBadge status={payment.status} />
              </View>
            </View>
          </View>
          <Text className="mt-5 text-xs uppercase tracking-widest text-mist-500">
            {t.details.amount}
          </Text>
          <Text className="mt-1 text-4xl font-bold text-gold-300">
            {formatMoney(payment.amount)}
          </Text>

          {payment.requiresReadings ? (
            <Pressable
              onPress={() => setReadingsVisible(true)}
              className="mt-5 h-11 flex-row items-center justify-center rounded-xl border border-gold-400/40 bg-gold-400/10 active:bg-gold-400/20"
            >
              <Ionicons name="speedometer-outline" size={16} color={colors.gold[300]} />
              <Text className="ml-2 text-sm font-semibold text-gold-300">
                {t.card.enterReadings}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => setPayVisible(true)}
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
        </GlassCard>

        {/* Уся інформація */}
        <GlassCard className="mt-4 p-5">
          {meta.map((r) => (
            <InfoRow
              key={r.key}
              label={r.label}
              value={r.value}
              highlight={r.key === "next" && !isPaid}
            />
          ))}
          {info.map((r) => (
            <InfoRow key={r.key} label={r.label} value={r.value} />
          ))}
        </GlassCard>

        {/* Історія показників */}
        {payment.requiresReadings ? (
          <GlassCard className="mt-4 p-5">
            <Text className="mb-3 text-lg font-semibold text-mist-100">
              {t.details.readingsHistory}
            </Text>
            {myReadings.length === 0 ? (
              <Text className="text-sm text-mist-300">{t.details.noReadings}</Text>
            ) : (
              myReadings.map((r, i) => (
                <View
                  key={r.id}
                  className={`flex-row items-center py-3 ${i > 0 ? "border-t border-white/10" : ""}`}
                >
                  <View className="flex-1">
                    <Text className="text-xs text-mist-500">{formatDate(r.readOn)}</Text>
                    <Text className="mt-0.5 text-base font-medium text-mist-100">
                      {r.previousValue} → {r.value} {r.unit ?? ""}
                    </Text>
                    <Text className="mt-0.5 text-sm text-mist-300">
                      +{r.consumption.toFixed(1)} {r.unit ?? ""} · {formatMoney(r.amount)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => openEdit(r)}
                    accessibilityLabel={t.details.editReading}
                    hitSlop={8}
                    className="h-10 w-10 items-center justify-center rounded-full active:bg-white/10"
                  >
                    <Ionicons name="create-outline" size={18} color={colors.sky[300]} />
                  </Pressable>
                </View>
              ))
            )}
          </GlassCard>
        ) : null}

        {/* Історія оплат */}
        <GlassCard className="mt-4 p-5">
          <Text className="mb-3 text-lg font-semibold text-mist-100">
            {t.details.paymentsHistory}
          </Text>
          {myEvents.length === 0 ? (
            <Text className="text-sm text-mist-300">{t.details.noPayments}</Text>
          ) : (
            myEvents.map((e, i) => (
              <View
                key={e.id}
                className={`flex-row items-center justify-between py-3 ${i > 0 ? "border-t border-white/10" : ""}`}
              >
                <Text className="text-base text-mist-100">{formatDate(e.paidOn)}</Text>
                <Text className="text-base font-medium text-sky-300">{formatMoney(e.amount)}</Text>
              </View>
            ))
          )}
        </GlassCard>
      </ScrollView>

      <ReadingsSheet
        visible={readingsVisible}
        payment={payment}
        onClose={() => setReadingsVisible(false)}
        onSubmit={submitReadings}
      />
      <PaySheet
        visible={payVisible}
        payment={payment}
        onClose={() => setPayVisible(false)}
        onConfirm={markPaid}
      />
      <ReadingEditSheet
        visible={editVisible}
        entry={editEntry}
        nextValue={nextValueFor(editEntry)}
        onClose={() => setEditVisible(false)}
        onSave={editReading}
      />
    </Screen>
  );
}

/** Екран повної інформації про платіж (параметр ?id=...). */
export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, initializing } = useAuth();
  const { getPayment, loading } = usePayments();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Redirect href="/login" />;

  const payment = id ? getPayment(id) : undefined;
  if (!payment) return loading ? <LoadingScreen /> : <Redirect href="/(tabs)" />;

  return <Details payment={payment} />;
}
