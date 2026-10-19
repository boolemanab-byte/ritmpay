import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddFab } from "@/components/payments/AddFab";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { PaymentMenuSheet } from "@/components/payments/PaymentMenuSheet";
import { ReadingsSheet } from "@/components/payments/ReadingsSheet";
import { FilterBar } from "@/components/ui/FilterBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/context/PaymentsContext";
import { CATEGORY_DEFS } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { needsReadings } from "@/lib/paymentInfo";
import { plural, t } from "@/lib/i18n";
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

  const summary = useMemo(() => {
    const pending = payments.filter((p) => p.status === "pending");
    return {
      pendingCount: pending.length,
      pendingTotal: pending.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments]);

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
            onEnterReadings={openReadings}
            onMarkPaid={(p) => markPaid(p.id)}
            onOpenMenu={openMenu}
            onOpen={openDetails}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
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
                {t.dashboard.dueSoon}
              </Text>
              <Text className="mt-1 text-4xl font-bold text-gold-300">
                {formatMoney(summary.pendingTotal)}
              </Text>
              <Text className="mt-1 text-sm text-mist-300">
                {summary.pendingCount}{" "}
                {plural(summary.pendingCount, ["платіж", "платежі", "платежів"])}{" "}
                {plural(summary.pendingCount, ["очікує", "очікують", "очікують"])}
              </Text>
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
