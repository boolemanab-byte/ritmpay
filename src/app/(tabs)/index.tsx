import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddFab } from "@/components/payments/AddFab";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { ReadingsSheet } from "@/components/payments/ReadingsSheet";
import { GlassCard } from "@/components/ui/GlassCard";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/format";
import { TAB_BAR_HEIGHT } from "@/lib/layout";
import { MOCK_PAYMENTS } from "@/lib/mockData";
import type { Payment } from "@/lib/types";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;
  const { user } = useAuth();

  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const summary = useMemo(() => {
    const pending = payments.filter((p) => p.status === "pending");
    return {
      pendingCount: pending.length,
      pendingTotal: pending.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments]);

  const openReadings = useCallback((p: Payment) => {
    setSelected(p);
    setSheetVisible(true);
  }, []);

  const handleSubmitReadings = useCallback(
    (id: string, reading: number, total: number) => {
      // TODO(Supabase): insert into `meter_readings` (payment_id, value, created_at)
      // and update `payments.amount`, ideally in one RPC call / transaction.
      // TODO(OCR): store the meter photo in Supabase Storage and link it to the
      // reading row for audit/dispute purposes.
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, lastReading: reading, amount: total, status: "pending" }
            : p
        )
      );
    },
    []
  );

  const handleAdd = useCallback(() => {
    // TODO: navigate to a dedicated "add payment" modal route, e.g.
    // router.push("/add-payment") with category, amount, schedule and
    // optional meter/tariff setup. For now we append a mock payment.
    setPayments((prev) => [
      ...prev,
      {
        id: `mock-${Date.now()}`,
        title: "New payment",
        category: "other",
        status: "pending",
        amount: 0,
        previousPaymentDate: "2026-10-19",
        nextPaymentDate: "2026-11-19",
        requiresReadings: false,
      },
    ]);
  }, []);

  return (
    <Screen>
      <FlatList
        data={payments}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PaymentCard payment={item} onEnterReadings={openReadings} />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-[640px] self-center px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: tabBarHeight + 110, // room for the FAB
        }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-sm text-mist-300">Hello,</Text>
            <Text className="text-3xl font-bold text-mist-100">
              {user?.name ?? "there"}
            </Text>

            <GlassCard className="mt-5 p-5" intensity={35}>
              <Text className="text-xs uppercase tracking-widest text-mist-500">
                Due soon
              </Text>
              <Text className="mt-1 text-4xl font-bold text-gold-300">
                {formatMoney(summary.pendingTotal)}
              </Text>
              <Text className="mt-1 text-sm text-mist-300">
                {summary.pendingCount} pending payment
                {summary.pendingCount === 1 ? "" : "s"}
              </Text>
            </GlassCard>

            <Text className="mb-1 mt-8 text-lg font-semibold text-mist-100">
              Recurring payments
            </Text>
          </View>
        }
      />

      <AddFab onPress={handleAdd} bottom={tabBarHeight + 16} />

      <ReadingsSheet
        visible={sheetVisible}
        payment={selected}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSubmitReadings}
      />
    </Screen>
  );
}