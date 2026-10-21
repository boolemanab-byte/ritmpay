import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomFieldsEditor, newFieldId } from "@/components/payments/CustomFieldsEditor";
import { IconPicker } from "@/components/payments/IconPicker";
import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/context/PaymentsContext";
import {
  CATEGORY_DEFS,
  DEFAULT_CUSTOM_ICON,
  UNITS,
  getCategoryDef,
  getSubcategoryDef,
  paymentIcon,
  type IconName,
} from "@/lib/categories";
import { addMonths, parseUaDate, todayIso } from "@/lib/dates";
import { formatDate, parseNumber } from "@/lib/format";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type {
  CustomField,
  Payment,
  PaymentCategory,
  PaymentInput,
  PaymentUnit,
} from "@/lib/types";

const PERIODS = [1, 3, 12] as const;

const asText = (n: number | undefined) => (n === undefined ? "" : String(n));
const orUndef = (v: string) => (v.trim() === "" ? undefined : v.trim());
const defaultSub = (c: PaymentCategory) => getCategoryDef(c).subcategories[0]?.key ?? "";

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2 ml-1 text-xs font-medium uppercase tracking-widest text-mist-300">
      {children}
    </Text>
  );
}

interface SavedCustom {
  name: string;
  icon: IconName;
  fields: CustomField[];
}

function PaymentForm({ editing }: { editing?: Payment }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { payments, addPayment, updatePayment } = usePayments();
  const [saving, setSaving] = useState(false);

  const initialCategory = editing?.category ?? "utilities";
  const [category, setCategory] = useState<PaymentCategory>(initialCategory);
  // Ключ вбудованої підкатегорії (для «Іншого» не використовується)
  const [subKey, setSubKey] = useState(
    editing && editing.category !== "other" ? editing.subcategory : defaultSub(initialCategory)
  );
  // «Інше»: власна підкатегорія, значок і поля
  const [customName, setCustomName] = useState(
    editing?.category === "other" ? editing.subcategory : ""
  );
  const [customIcon, setCustomIcon] = useState<IconName>(
    editing?.category === "other" ? paymentIcon(editing) : DEFAULT_CUSTOM_ICON
  );
  const [customFields, setCustomFields] = useState<CustomField[]>(
    editing?.customFields ?? []
  );

  const sub = category === "other" ? undefined : getSubcategoryDef(category, subKey);
  const autoTitle = category === "other" ? customName : sub?.label ?? "";

  const [title, setTitle] = useState(editing?.title ?? autoTitle);
  const [titleTouched, setTitleTouched] = useState(!!editing);
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [periodMonths, setPeriodMonths] = useState(editing?.periodMonths ?? 1);
  // «Кожні 4 тижні» — лише для мобільного зв’язку
  const [periodWeeks, setPeriodWeeks] = useState<number | undefined>(editing?.periodWeeks);
  const [nextDate, setNextDate] = useState(
    formatDate(editing?.nextPaymentDate ?? addMonths(todayIso(), 1))
  );

  // Лічильник і тариф
  const [hasMeter, setHasMeter] = useState(
    editing ? editing.requiresReadings : !!sub?.meterAlways
  );
  const [unit, setUnit] = useState<PaymentUnit | undefined>(editing?.unit ?? sub?.unit);
  const [tariff, setTariff] = useState(
    asText(editing?.tariff ?? (sub?.monthlyTariff ? editing?.amount : undefined))
  );
  const [reading, setReading] = useState(asText(editing?.lastReading));

  // Комуналка / Зв’язок / Оренда
  const [accountNumber, setAccountNumber] = useState(editing?.accountNumber ?? "");
  const [payerName, setPayerName] = useState(editing?.payerName ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");
  const [bankDetails, setBankDetails] = useState(editing?.bankDetails ?? "");
  const [phoneNumber, setPhoneNumber] = useState(editing?.phoneNumber ?? "");
  const [planName, setPlanName] = useState(editing?.planName ?? "");

  const [error, setError] = useState<string | null>(null);

  const weeksAllowed = category === "communication" && subKey === "mobile";
  const weeksOn = weeksAllowed && periodWeeks !== undefined;
  const monthly = !!sub?.monthlyTariff;
  const meterAlways = !!sub?.meterAlways;
  const meterOn = !monthly && (meterAlways || hasMeter);
  const effectiveUnit: PaymentUnit = unit ?? sub?.unit ?? "м³";
  const showTariff = !monthly && (meterOn || category === "utilities");

  // Раніше створені підкатегорії «Іншого» — щоб обирати їх, а не вводити щоразу
  const savedCustom = useMemo(() => {
    const map = new Map<string, SavedCustom>();
    for (const p of payments) {
      if (p.category !== "other" || !p.subcategory.trim()) continue;
      const key = p.subcategory.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: p.subcategory, icon: paymentIcon(p), fields: p.customFields });
      }
    }
    return [...map.values()];
  }, [payments]);

  const syncTitle = (value: string) => {
    // Підставляти назву підкатегорії, доки користувач не змінив назву вручну
    if (!titleTouched) setTitle(value);
  };

  const pickSub = (c: PaymentCategory, key: string) => {
    const def = getSubcategoryDef(c, key);
    setSubKey(key);
    setTariff("");
    setHasMeter(!!def?.meterAlways);
    setUnit(def?.unit);
    syncTitle(def?.label ?? "");
  };

  const pickCategory = (c: PaymentCategory) => {
    if (c === category) return;
    setCategory(c);
    setError(null);
    if (c === "other") {
      setSubKey("");
      setHasMeter(false);
      setUnit(undefined);
      setCustomName("");
      setCustomIcon(DEFAULT_CUSTOM_ICON);
      setCustomFields([]);
      syncTitle("");
    } else {
      pickSub(c, defaultSub(c));
    }
  };

  const pickSaved = (c: SavedCustom) => {
    setCustomName(c.name);
    setCustomIcon(c.icon);
    // Беремо лише структуру полів, значення вводяться заново
    setCustomFields(c.fields.map((f) => ({ ...f, id: newFieldId(), value: "" })));
    syncTitle(c.name);
  };

  const pickNewCustom = () => {
    setCustomName("");
    setCustomIcon(DEFAULT_CUSTOM_ICON);
    setCustomFields([]);
    syncTitle("");
  };

  const onSave = async () => {
    if (title.trim().length < 1) return setError(t.form.errTitle);
    if (category === "other" && customName.trim().length < 1) {
      return setError(t.form.errSubcategory);
    }

    const isoDate = parseUaDate(nextDate);
    if (!isoDate) return setError(t.form.errDate);

    // «Тариф за місяць» одночасно є сумою платежу
    let monthlyNum = 0;
    if (monthly) {
      monthlyNum = parseNumber(tariff);
      if (Number.isNaN(monthlyNum) || monthlyNum <= 0) return setError(t.form.errTariff);
    }

    // Для лічильників сума необов’язкова (рахується з показників)
    const amountNum = monthly
      ? monthlyNum
      : amount.trim() === "" && meterOn
        ? 0
        : parseNumber(amount);
    if (Number.isNaN(amountNum) || amountNum < 0 || (!meterOn && amountNum <= 0)) {
      return setError(t.form.errAmount);
    }

    let tariffNum: number | undefined = monthly ? monthlyNum : undefined;
    let readingNum: number | undefined;
    if (meterOn) {
      tariffNum = parseNumber(tariff);
      readingNum = parseNumber(reading);
      if (Number.isNaN(tariffNum) || tariffNum <= 0) return setError(t.form.errTariff);
      if (Number.isNaN(readingNum) || readingNum < 0) return setError(t.form.errReading);
    } else if (category === "utilities" && tariff.trim() !== "") {
      tariffNum = parseNumber(tariff);
      if (Number.isNaN(tariffNum) || tariffNum <= 0) return setError(t.form.errTariff);
    }

    // Власні поля: порожні рядки відкидаємо, решту перевіряємо
    const cleanFields: CustomField[] = [];
    if (category === "other") {
      for (const f of customFields) {
        const label = f.label.trim();
        const value = f.value.trim();
        if (!label && !value) continue;
        if (!label) return setError(t.form.errFieldLabel);
        if (f.type === "number" && value !== "") {
          const n = parseNumber(value);
          if (Number.isNaN(n)) return setError(t.form.errFieldNumber);
          cleanFields.push({ ...f, label, value: String(n) });
        } else {
          cleanFields.push({ ...f, label, value });
        }
      }
    }

    const input: PaymentInput = {
      title: title.trim(),
      category,
      subcategory: category === "other" ? customName.trim() : subKey,
      amount: amountNum,
      nextPaymentDate: isoDate,
      periodMonths: weeksOn ? 1 : periodMonths,
      periodWeeks: weeksOn ? periodWeeks : undefined,
      requiresReadings: meterOn,
      unit: monthly ? "міс." : meterOn || tariffNum !== undefined ? effectiveUnit : undefined,
      tariff: tariffNum,
      lastReading: readingNum,
      accountNumber: category === "utilities" ? orUndef(accountNumber) : undefined,
      payerName: category === "utilities" ? orUndef(payerName) : undefined,
      address: category === "utilities" ? orUndef(address) : undefined,
      bankDetails:
        category === "utilities" || category === "rent" ? orUndef(bankDetails) : undefined,
      phoneNumber: subKey === "mobile" ? orUndef(phoneNumber) : undefined,
      planName: category === "communication" ? orUndef(planName) : undefined,
      icon: category === "other" ? customIcon : undefined,
      customFields: cleanFields,
    };

    setError(null);
    setSaving(true);
    try {
      if (editing) await updatePayment(editing.id, input);
      else await addPayment(input);
      router.back();
    } catch (e) {
      console.warn("Save payment:", e);
      setError(t.errors.save);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="w-full max-w-xl self-center px-5"
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {/* Шапка */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-mist-100">
              {editing ? t.form.editTitle : t.form.addTitle}
            </Text>
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel={t.common.close}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 active:bg-white/10"
            >
              <Ionicons name="close" size={20} color={colors.mist[100]} />
            </Pressable>
          </View>

          <GlassCard className="p-5">
            {/* Категорія */}
            <SectionLabel>{t.form.category}</SectionLabel>
            <View className="mb-4 flex-row flex-wrap">
              {CATEGORY_DEFS.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  selected={category === c.key}
                  onPress={() => pickCategory(c.key)}
                />
              ))}
            </View>

            {/* Підкатегорія */}
            {category !== "other" ? (
              <>
                <SectionLabel>{t.form.subcategory}</SectionLabel>
                <View className="mb-4 flex-row flex-wrap">
                  {getCategoryDef(category).subcategories.map((sc) => (
                    <Chip
                      key={sc.key}
                      label={sc.label}
                      selected={subKey === sc.key}
                      onPress={() => pickSub(category, sc.key)}
                    />
                  ))}
                </View>
              </>
            ) : (
              <>
                <SectionLabel>{t.form.subcategory}</SectionLabel>
                <View className="mb-2 flex-row flex-wrap">
                  {savedCustom.map((c) => (
                    <Chip
                      key={c.name}
                      label={c.name}
                      selected={customName.trim().toLowerCase() === c.name.toLowerCase()}
                      onPress={() => pickSaved(c)}
                    />
                  ))}
                  <Chip
                    label={t.form.newSubcategory}
                    selected={
                      !savedCustom.some(
                        (c) => c.name.toLowerCase() === customName.trim().toLowerCase()
                      )
                    }
                    onPress={pickNewCustom}
                  />
                </View>

                <TextField
                  label={t.form.customName}
                  icon="pricetag-outline"
                  placeholder={t.form.customNamePlaceholder}
                  autoCapitalize="sentences"
                  value={customName}
                  onChangeText={(v) => {
                    setCustomName(v);
                    syncTitle(v);
                  }}
                />

                <SectionLabel>{t.form.icon}</SectionLabel>
                <IconPicker value={customIcon} onChange={setCustomIcon} />
              </>
            )}

            <TextField
              label={t.form.name}
              icon="create-outline"
              placeholder={t.form.namePlaceholder}
              autoCapitalize="sentences"
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                setTitleTouched(true);
              }}
            />

            {!monthly ? (
            <TextField
                label={t.form.amount}
                icon="cash-outline"
                placeholder={meterOn ? t.form.amountHint : "0,00"}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            ) : null}

            {/* Періодичність */}
            <Text className="mb-2 ml-1 text-xs font-medium uppercase tracking-widest text-mist-300">
              {t.form.period}
            </Text>
            <View className="mb-4 flex-row flex-wrap">
              {PERIODS.map((p) => (
                <Chip
                  key={p}
                  label={t.periods[p]}
                  selected={!weeksOn && periodMonths === p}
                  onPress={() => {
                    setPeriodMonths(p);
                    setPeriodWeeks(undefined);
                  }}
                />
              ))}
              {weeksAllowed ? (
                <Chip
                  label={t.periodWeeks(4)}
                  selected={weeksOn && periodWeeks === 4}
                  onPress={() => setPeriodWeeks(4)}
                />
              ) : null}
            </View>

            {/* TODO: замінити текстове поле на системний вибір дати
                (@react-native-community/datetimepicker або модальний календар) */}
            <TextField
              label={t.form.nextDate}
              icon="calendar-outline"
              placeholder={t.form.nextDatePlaceholder}
              keyboardType="numbers-and-punctuation"
              value={nextDate}
              onChangeText={setNextDate}
            />
          </GlassCard>

          {/* Дані за категорією */}
          {category === "utilities" ? (
            <GlassCard className="mt-4 p-5">
              <TextField
                label={t.form.accountNumber}
                icon="document-text-outline"
                keyboardType="numbers-and-punctuation"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
              <TextField
                label={t.form.payerName}
                icon="person-outline"
                autoCapitalize="words"
                value={payerName}
                onChangeText={setPayerName}
              />
              <TextField
                label={t.form.address}
                icon="location-outline"
                autoCapitalize="sentences"
                value={address}
                onChangeText={setAddress}
              />
              <TextField
                label={t.form.bankDetails}
                icon="card-outline"
                placeholder={t.form.bankDetailsHint}
                autoCapitalize="characters"
                multiline
                value={bankDetails}
                onChangeText={setBankDetails}
              />
            </GlassCard>
          ) : null}

          {category === "communication" ? (
            <GlassCard className="mt-4 p-5">
              {subKey === "mobile" ? (
                <TextField
                  label={t.form.phone}
                  icon="call-outline"
                  placeholder="+380"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              ) : null}
              <TextField
                label={t.form.plan}
                icon="pricetag-outline"
                autoCapitalize="sentences"
                value={planName}
                onChangeText={setPlanName}
              />
            </GlassCard>
          ) : null}

          {category === "rent" ? (
            <GlassCard className="mt-4 p-5">
              <TextField
                label={t.form.rentDetails}
                icon="card-outline"
                autoCapitalize="characters"
                multiline
                value={bankDetails}
                onChangeText={setBankDetails}
              />
            </GlassCard>
          ) : null}

          {category === "other" ? (
            <GlassCard className="mt-4 p-5">
              <SectionLabel>{t.form.customFields}</SectionLabel>
              <CustomFieldsEditor fields={customFields} onChange={setCustomFields} />
            </GlassCard>
          ) : null}

          {/* Лічильник і тариф */}
          {monthly ? (
            <GlassCard className="mt-4 p-5">
              <TextField
                label={t.form.monthlyTariff}
                icon="pricetag-outline"
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={tariff}
                onChangeText={setTariff}
              />
            </GlassCard>
          ) : (
            <>
          <GlassCard className="mt-4 p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-mist-100">
                  {t.form.hasMeter}
                </Text>
                {meterAlways ? (
                  <Text className="mt-0.5 text-sm text-mist-300">
                    {t.form.meterLocked} · {effectiveUnit}
                  </Text>
                ) : null}
              </View>
              <Switch
                value={meterOn}
                disabled={meterAlways}
                onValueChange={setHasMeter}
                trackColor={{ false: "rgba(255,255,255,0.15)", true: colors.sky[500] }}
                thumbColor={colors.mist[100]}
              />
            </View>

            {/* Одиниця: для води, газу й світла фіксована, для решти — на вибір */}
            {showTariff && !meterAlways ? (
              <View className="mt-5">
                <SectionLabel>{meterOn ? t.form.meterUnit : t.form.tariffUnit}</SectionLabel>
                <View className="flex-row flex-wrap">
                  {UNITS.map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      selected={effectiveUnit === u}
                      onPress={() => setUnit(u)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {showTariff ? (
              <View className={meterAlways ? "mt-5" : "mt-1"}>
                <TextField
                  label={
                    meterOn
                      ? `${t.form.tariff} / ${effectiveUnit}`
                      : t.form.tariffOptional.replace("за одиницю", `за ${effectiveUnit}`)
                  }
                  icon="pricetag-outline"
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  value={tariff}
                  onChangeText={setTariff}
                />
                {meterOn ? (
                  <TextField
                    label={`${t.form.initialReading} (${effectiveUnit})`}
                    icon="speedometer-outline"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={reading}
                    onChangeText={setReading}
                  />
                ) : null}
              </View>
            ) : null}
          </GlassCard>
            </>
          )}

          {error ? <Text className="mt-4 text-sm text-red-300">{error}</Text> : null}

          <View className="mt-6">
            <GradientButton title={t.form.save} onPress={onSave} loading={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Екран-модалка для створення та редагування платежу (параметр ?id=...). */
export default function PaymentFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, initializing } = useAuth();
  const { getPayment, loading } = usePayments();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Redirect href="/login" />;

  const editing = id ? getPayment(id) : undefined;
  if (id && !editing) {
    // Список ще вантажиться (оновлення сторінки) або платіж видалили
    return loading ? <LoadingScreen /> : <Redirect href="/(tabs)" />;
  }

  // key гарантує, що поля заповняться саме даними цього платежу
  return <PaymentForm key={id ?? "new"} editing={editing} />;
}
