import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddFab } from "@/components/payments/AddFab";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { PaymentMenuSheet } from "@/components/payments/PaymentMenuSheet";
import { PaySheet } from "@/components/payments/PaySheet";
import { ReadingsSheet } from "@/components/payments/ReadingsSheet";
import { FilterBar } from "@/components/ui/FilterBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/context/PaymentsContext";
import { CATEGORY_DEFS } from "@/lib/categories";
import { todayIso } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { needsReadings } from "@/lib/paymentInfo";
import { t } from "@/lib/i18n";
import { monthName, paymentsWord, summarize } from "@/lib/schedule";
import { TAB_BAR_HEIGHT } from "@/lib/layout";
import { colors } from "@/lib/theme";
import type { Payment, PaymentCategory } from "@/lib/types";

type StatusFilter = "all" | "unpaid" | "paid" | "noReadings";
type CategoryFilter = "all" | PaymentCategory;

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: t.filters.all },
  { key: "unpaid", label: t.filters.unpaid },
  { key: "paid", label: t.filters.paid },
  { key: "noReadings", label: t.filters.noReadings },
];

const CATEGORY_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: t.filters.allCategories },
  ...CATEGORY_DEFS.map((c) => ({ key: c.key as CategoryFilter, label: c.label })),
];

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;
  const { user } = useAuth();
  const {
    payments,
    readings,
    events,
    loading,
    error,
    clearError,
    markPaid,
    deletePayment,
    submitReadings,
  } = usePayments();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [readingsFor, setReadingsFor] = useState<Payment | null>(null);
  const [readingsVisible, setReadingsVisible] = useState(false);
  const [menuFor, setMenuFor] = useState<Payment | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [payFor, setPayFor] = useState<Payment | null>(null);
  const [payVisible, setPayVisible] = useState(false);
  // Картки за замовчуванням згорнуті; тут — id тих, що розгорнув користувач
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const summary = useMemo(
    () => summarize(payments, events, todayIso()),
    [payments, events]
  );

  const toggleExpanded = useCallback((p: Payment) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
  }, []);

  const openPay = useCallback((p: Payment) => {
    setPayFor(p);
    setPayVisible(true);
  }, []);

  const visible = useMemo(
    () =>
      payments.filter((p) => {
        if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
        if (statusFilter === "unpaid") return p.status === "pending";
        if (statusFilter === "paid") return p.status === "paid";
        if (statusFilter === "noReadings") return needsReadings(p, readings);
        return true;
      }),
    [payments, readings, statusFilter, categoryFilter]
  );

  const openDetails = useCallback(
    (p: Payment) => router.push({ pathname: "/payment-details", params: { id: p.id } }),
    [router]
  );

  const openReadings = useCallback((p: Payment) => {
    setReadingsFor(p);
    setReadingsVisible(true);
  }, []);

  const openMenu = useCallback((p: Payment) => {
    setMenuFor(p);
    setMenuVisible(true);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("/payment-form");
  }, [router]);

  const handleEdit = useCallback(
    (p: Payment) => {
      setMenuVisible(false);
      router.push({ pathname: "/payment-form", params: { id: p.id } });
    },
    [router]
  );

  const handleDelete = useCallback(
    (p: Payment) => {
      deletePayment(p.id);
      setMenuVisible(false);
    },
    [deletePayment]
  );

  return (
    <Screen>
      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PaymentCard
            payment={item}
            expanded={expanded.has(item.id)}
            onToggle={toggleExpanded}
            onEnterReadings={openReadings}
            onPay={openPay}
            onOpenMenu={openMenu}
            onOpen={openDetails}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        extraData={expanded}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-[640px] self-center px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: tabBarHeight + 110, // місце для FAB
        }}
        ListHeaderComponent={
          <View className="mb-6">
            {error ? (
              <Pressable
                onPress={clearError}
                className="mb-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3"
              >
                <Text className="text-sm text-red-300">{error}</Text>
              </Pressable>
            ) : null}
            <Text className="text-sm text-mist-300">{t.dashboard.hello}</Text>
            <Text className="text-3xl font-bold text-mist-100">
              {user?.name ?? t.dashboard.fallbackName}
            </Text>

            <GlassCard className="mt-5 p-5" intensity={35}>
              <Text className="text-xs uppercase tracking-widest text-mist-500">
                {t.dashboard.toPayFor(monthName(summary.monthKey))}
              </Text>
              <Text className="mt-1 text-4xl font-bold text-gold-300">
                {formatMoney(summary.toPay)}
              </Text>
              <Text className="mt-1 text-sm text-mist-300">
                {summary.toPayCount > 0
                  ? `${summary.toPayCount} ${paymentsWord(summary.toPayCount)}`
                  : t.dashboard.nothingToPay}
              </Text>

              <View className="my-4 h-px bg-white/10" />

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-mist-300">{t.dashboard.paidThisMonth}</Text>
                <Text className="text-base font-semibold text-sky-300">
                  {formatMoney(summary.paid)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-mist-300">
                  {t.dashboard.forNextMonth(monthName(summary.nextMonthKey))}
                </Text>
                <Text className="text-base font-semibold text-mist-100">
                  {formatMoney(summary.nextMonth)}
                </Text>
              </View>

              {summary.debt > 0 ? (
                <View className="mt-4 flex-row items-center justify-between rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-red-300">
                      {t.dashboard.debt}
                    </Text>
                    <Text className="text-xs text-red-300/80">
                      {summary.debtCount} {paymentsWord(summary.debtCount)}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-red-300">
                    {formatMoney(summary.debt)}
                  </Text>
                </View>
              ) : null}
            </GlassCard>

            <Text className="mb-3 mt-8 text-lg font-semibold text-mist-100">
              {t.dashboard.recurring}
            </Text>

            <FilterBar options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            <FilterBar
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={colors.sky[400]} />
            </View>
          ) : (
            <GlassCard className="items-center p-8">
              <Text className="text-lg font-semibold text-mist-100">
                {payments.length > 0 ? t.filters.noResults : t.dashboard.emptyTitle}
              </Text>
              {payments.length === 0 ? (
                <Text className="mt-2 text-center text-sm text-mist-300">
                  {t.dashboard.emptyText}
                </Text>
              ) : null}
            </GlassCard>
          )
        }
      />

      <AddFab onPress={handleAdd} bottom={tabBarHeight + 16} />

      <ReadingsSheet
        visible={readingsVisible}
        payment={readingsFor}
        onClose={() => setReadingsVisible(false)}
        onSubmit={submitReadings}
      />

      <PaySheet
        visible={payVisible}
        payment={payFor}
        onClose={() => setPayVisible(false)}
        onConfirm={markPaid}
      />

      <PaymentMenuSheet
        visible={menuVisible}
        payment={menuFor}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Screen>
  );
}
