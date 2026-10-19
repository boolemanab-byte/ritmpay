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

  // Reset the input every time the sheet opens
  useEffect(() => {
    if (visible) setValue("");
  }, [visible]);

  // Mock auto-calculation: (current - previous) * tariff
  const calc = useMemo<Calc>(() => {
    const empty: Calc = { current: null, consumption: 0, total: 0 };
    if (!payment || payment.lastReading === undefined || payment.tariff === undefined)
      return empty;

    // Accept both "123.4" and "123,4"
    const current = parseFloat(value.replace(",", "."));
    if (Number.isNaN(current)) return empty;
    if (current < payment.lastReading)
      return { ...empty, error: "Reading can't be lower than the previous one." };

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
        {/* Backdrop */}
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />

        {/* Sheet */}
        <View
          className="w-full max-w-xl self-center rounded-t-[32px] border border-b-0 border-white/10 bg-ink-800 px-6 pt-3"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-white/20" />

          <Text className="text-xl font-semibold text-mist-100">
            Enter readings · {payment.title}
          </Text>
          <Text className="mb-5 mt-1 text-sm text-mist-300">
            Previous reading: {payment.lastReading} {payment.unit}
          </Text>

          <TextField
            label={`Current reading (${payment.unit})`}
            icon="speedometer-outline"
            placeholder={`e.g. ${(payment.lastReading ?? 0) + 25}`}
            keyboardType="decimal-pad"
            value={value}
            onChangeText={setValue}
          />

          {/* TODO(OCR): open expo-camera, capture the meter photo, send it to an
              OCR pipeline (e.g. a Supabase Edge Function calling a vision API, or
              on-device ML Kit / Apple Vision), then prefill `value` with the
              recognized digits so the user only has to confirm. */}
          <Pressable
            onPress={() => {}}
            className="mb-4 h-11 flex-row items-center justify-center rounded-xl border border-white/10 bg-white/5 active:bg-white/10"
          >
            <Ionicons name="camera-outline" size={16} color={colors.sky[300]} />
            <Text className="ml-2 text-sm font-medium text-sky-300">
              Scan meter with camera (soon)
            </Text>
          </Pressable>

          {calc.error ? (
            <Text className="mb-3 text-sm text-red-300">{calc.error}</Text>
          ) : null}

          {/* Auto-calculated sum */}
          <View className="mb-5 rounded-2xl border border-gold-400/25 bg-gold-400/10 p-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-mist-300">Consumption</Text>
              <Text className="text-sm text-mist-100">
                {calc.consumption.toFixed(1)} {payment.unit}
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-sm text-mist-300">Tariff</Text>
              <Text className="text-sm text-mist-100">
                {payment.tariff?.toFixed(2)} ₴ / {payment.unit}
              </Text>
            </View>
            <View className="my-3 h-px bg-white/10" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gold-300">To pay</Text>
              <Text className="text-2xl font-bold text-gold-300">
                {formatMoney(calc.total)}
              </Text>
            </View>
          </View>

          <GradientButton
            variant="gold"
            title="Submit readings"
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
