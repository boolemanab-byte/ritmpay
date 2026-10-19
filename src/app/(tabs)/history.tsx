import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterBar } from "@/components/ui/FilterBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Screen } from "@/components/ui/Screen";
import { usePayments } from "@/context/PaymentsContext";
import { CATEGORY_DEFS, paymentIcon, subcategoryLabel } from "@/lib/categories";
import { formatDate, formatMoney } from "@/lib/format";
import { plural, t } from "@/lib/i18n";
import { TAB_BAR_HEIGHT } from "@/lib/layout";
import { colors } from "@/lib/theme";
import type { PaymentCategory, PaymentEvent, ReadingEntry } from "@/lib/types";

type Tab = "payments" | "readings";
type CategoryFilter = "all" | PaymentCategory;
type Entry = PaymentEvent | ReadingEntry;

const TAB_OPTIONS: { key: Tab; label: string }[] = [
  { key: "payments", label: t.history.payments },
  { key: "readings", label: t.history.readings },
];

const CATEGORY_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: t.filters.allCategories },
  ...CATEGORY_DEFS.map((c) => ({ key: c.key as CategoryFilter, label: c.label })),
];

const isEvent = (e: Entry): e is PaymentEvent => "paidOn" in e;

function EntryRow({ entry }: { entry: Entry }) {
  const date = isEvent(entry) ? entry.paidOn : entry.readOn;
  return (
    <GlassCard className="p-4">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Ionicons name={paymentIcon(entry)} size={20} color={colors.sky[300]} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-mist-100" numberOfLines={1}>
            {entry.title}
          </Text>
          <Text className="text-xs text-mist-500" numberOfLines={1}>
            {subcategoryLabel(entry)} · {formatDate(date)}
          </Text>
        </View>
        <Text className="text-base font-semibold text-gold-300">{formatMoney(entry.amount)}</Text>
      </View>

      {!isEvent(entry) ? (
        <View className="mt-3 flex-row border-t border-white/10 pt-3">
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-mist-500">
              {t.history.readings}
            </Text>
            <Text className="mt-0.5 text-sm text-mist-100">
              {entry.previousValue} → {entry.value} {entry.unit ?? ""}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-mist-500">
              {t.history.consumption}
            </Text>
            <Text className="mt-0.5 text-sm text-mist-100">
              {entry.consumption.toFixed(1)} {entry.unit ?? ""}
            </Text>
          </View>
        </View>
      ) : null}
    </GlassCard>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;
  const { events, readings } = usePayments();

  const [tab, setTab] = useState<Tab>("payments");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [subcategory, setSubcategory] = useState("all");

  const source: Entry[] = tab === "payments" ? events : readings;

  // Підкатегорії, що реально є в історії обраної категорії
  const subOptions = useMemo(() => {
    if (category === "all") return [];
    const seen = new Map<string, string>();
    for (const e of source) {
      if (e.category !== category || seen.has(e.subcategory)) continue;
      seen.set(e.subcategory, subcategoryLabel(e));
    }
    if (seen.size < 2) return [];
    return [
      { key: "all", label: t.filters.allSubcategories },
      ...[...seen].map(([key, label]) => ({ key, label })),
    ];
  }, [source, category]);

  const visible = useMemo(
    () =>
      source.filter(
        (e) =>
          (category === "all" || e.category === category) &&
          (subcategory === "all" || e.subcategory === subcategory)
      ),
    [source, category, subcategory]
  );

  const total = useMemo(() => visible.reduce((sum, e) => sum + e.amount, 0), [visible]);

  const changeTab = (next: Tab) => {
    setTab(next);
    setSubcategory("all");
  };
  const changeCategory = (next: CategoryFilter) => {
    setCategory(next);
    setSubcategory("all");
  };

  return (
    <Screen>
      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EntryRow entry={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-[640px] self-center px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: tabBarHeight + 24,
        }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="mb-4 text-3xl font-bold text-mist-100">{t.history.title}</Text>

            <FilterBar options={TAB_OPTIONS} value={tab} onChange={changeTab} />
            <FilterBar options={CATEGORY_OPTIONS} value={category} onChange={changeCategory} />
            {subOptions.length > 0 ? (
              <FilterBar options={subOptions} value={subcategory} onChange={setSubcategory} />
            ) : null}

            {visible.length > 0 ? (
              <Text className="mt-1 text-sm text-mist-300">
                {visible.length}{" "}
                {tab === "payments"
                  ? plural(visible.length, ["оплата", "оплати", "оплат"])
                  : plural(visible.length, ["показник", "показники", "показників"])}
                {tab === "payments" ? ` · ${t.history.total}: ${formatMoney(total)}` : ""}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <GlassCard className="items-center p-8">
            <Text className="text-center text-sm text-mist-300">
              {source.length === 0
                ? tab === "payments"
                  ? t.history.emptyPayments
                  : t.history.emptyReadings
                : t.history.noResults}
            </Text>
          </GlassCard>
        }
      />
    </Screen>
  );
}
