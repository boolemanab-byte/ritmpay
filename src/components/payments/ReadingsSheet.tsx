import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField } from "@/components/ui/TextField";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { Payment } from "@/lib/types";

interface Props {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSubmit: (paymentId: string, reading: number, total: number) => void;
}

interface Calc {
  current: number | null;
  consumption: number;
  total: number;
  error?: string;
}

export function ReadingsSheet({ visible, payment, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState("");

  // Скидати поле щоразу, коли шторка відкривається
  useEffect(() => {
    if (visible) setValue("");
  }, [visible]);

  // Автоматичний розрахунок: (поточні - попередні) * тариф
  const calc = useMemo<Calc>(() => {
    const empty: Calc = { current: null, consumption: 0, total: 0 };
    if (!payment || payment.lastReading === undefined || payment.tariff === undefined)
      return empty;

    // Приймаємо і "123.4", і "123,4"
    const current = parseFloat(value.replace(",", "."));
    if (Number.isNaN(current)) return empty;
    if (current < payment.lastReading) return { ...empty, error: t.readings.errLower };

    const consumption = current - payment.lastReading;
    return { current, consumption, total: consumption * payment.tariff };
  }, [value, payment]);

  const canSubmit = calc.current !== null && !calc.error;

  if (!payment) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        {/* Підкладка */}
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />

        {/* Шторка */}
        <View
          className="w-full max-w-xl self-center rounded-t-[32px] border border-b-0 border-white/10 bg-ink-800 px-6 pt-3"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-white/20" />

          <Text className="text-xl font-semibold text-mist-100">
            {t.readings.title} · {payment.title}
          </Text>
          <Text className="mb-5 mt-1 text-sm text-mist-300">
            {t.readings.previous}: {payment.lastReading} {payment.unit}
          </Text>

          <TextField
            label={`${t.readings.current} (${payment.unit})`}
            icon="speedometer-outline"
            placeholder={`${t.readings.placeholder} ${(payment.lastReading ?? 0) + 25}`}
            keyboardType="decimal-pad"
            value={value}
            onChangeText={setValue}
          />

          {/* TODO(OCR): відкрити expo-camera, зробити фото лічильника, надіслати в
              OCR (Supabase Edge Function з vision API або ML Kit / Apple Vision на
              пристрої) і підставити розпізнані цифри в `value` — користувачу
              лишиться лише підтвердити. */}
          <Pressable
            onPress={() => {}}
            className="mb-4 h-11 flex-row items-center justify-center rounded-xl border border-white/10 bg-white/5 active:bg-white/10"
          >
            <Ionicons name="camera-outline" size={16} color={colors.sky[300]} />
            <Text className="ml-2 text-sm font-medium text-sky-300">
              {t.readings.scan}
            </Text>
          </Pressable>

          {calc.error ? (
            <Text className="mb-3 text-sm text-red-300">{calc.error}</Text>
          ) : null}

          {/* Авторозрахунок суми */}
          <View className="mb-5 rounded-2xl border border-gold-400/25 bg-gold-400/10 p-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-mist-300">{t.readings.consumption}</Text>
              <Text className="text-sm text-mist-100">
                {calc.consumption.toFixed(1)} {payment.unit}
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-sm text-mist-300">{t.readings.tariff}</Text>
              <Text className="text-sm text-mist-100">
                {payment.tariff?.toFixed(2)} ₴ / {payment.unit}
              </Text>
            </View>
            <View className="my-3 h-px bg-white/10" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gold-300">{t.readings.toPay}</Text>
              <Text className="text-2xl font-bold text-gold-300">
                {formatMoney(calc.total)}
              </Text>
            </View>
          </View>

          <GradientButton
            variant="gold"
            title={t.readings.submit}
            disabled={!canSubmit}
            onPress={() => {
              if (calc.current === null) return;
              onSubmit(payment.id, calc.current, calc.total);
              onClose();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
