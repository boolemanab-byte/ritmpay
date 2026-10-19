import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField } from "@/components/ui/TextField";
import { formatDate, formatMoney, parseNumber } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { ReadingEntry } from "@/lib/types";

interface Props {
  visible: boolean;
  entry: ReadingEntry | null;
  /** Значення наступного (новішого) показника цього платежу — верхня межа */
  nextValue: number | null;
  onClose: () => void;
  onSave: (id: string, value: number) => Promise<void>;
}

/** Шторка редагування одного показника з історії. */
export function ReadingEditSheet({ visible, entry, nextValue, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && entry) {
      setText(String(entry.value));
      setServerError(null);
    }
  }, [visible, entry]);

  const calc = useMemo(() => {
    if (!entry) return { value: null as number | null, consumption: 0, amount: 0, error: undefined as string | undefined };
    const value = parseNumber(text);
    if (Number.isNaN(value)) return { value: null, consumption: 0, amount: 0, error: undefined };
    if (value < entry.previousValue) {
      return { value: null, consumption: 0, amount: 0, error: t.details.errLower };
    }
    if (nextValue !== null && value > nextValue) {
      return { value: null, consumption: 0, amount: 0, error: t.details.errHigher };
    }
    const consumption = value - entry.previousValue;
    return { value, consumption, amount: consumption * entry.tariff, error: undefined };
  }, [text, entry, nextValue]);

  if (!entry) return null;
  const unit = entry.unit ?? "";

  const submit = async () => {
    if (calc.value === null) return;
    setSaving(true);
    setServerError(null);
    try {
      await onSave(entry.id, calc.value);
      onClose();
    } catch (e) {
      console.warn("Edit reading:", e);
      setServerError(t.errors.save);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />
        <View
          className="w-full max-w-xl self-center rounded-t-[32px] border border-b-0 border-white/10 bg-ink-800 px-6 pt-3"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-white/20" />
          <Text className="text-xl font-semibold text-mist-100">
            {t.details.editReading} · {entry.title}
          </Text>
          <Text className="mb-5 mt-1 text-sm text-mist-300">
            {formatDate(entry.readOn)} · {t.details.previousValue}: {entry.previousValue} {unit}
            {nextValue !== null ? `\n${t.details.nextLimit}: ${nextValue} ${unit}` : ""}
          </Text>

          <TextField
            label={`${t.details.newValue} (${unit})`}
            icon="speedometer-outline"
            keyboardType="decimal-pad"
            value={text}
            onChangeText={setText}
          />

          {calc.error ? <Text className="mb-3 text-sm text-red-300">{calc.error}</Text> : null}
          {serverError ? <Text className="mb-3 text-sm text-red-300">{serverError}</Text> : null}

          <View className="mb-5 rounded-2xl border border-gold-400/25 bg-gold-400/10 p-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-mist-300">{t.details.consumption}</Text>
              <Text className="text-sm text-mist-100">
                {calc.consumption.toFixed(1)} {unit}
              </Text>
            </View>
            <View className="my-3 h-px bg-white/10" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gold-300">{t.details.amount}</Text>
              <Text className="text-2xl font-bold text-gold-300">{formatMoney(calc.amount)}</Text>
            </View>
          </View>

          <GradientButton
            variant="gold"
            title={t.common.save}
            disabled={calc.value === null}
            loading={saving}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
