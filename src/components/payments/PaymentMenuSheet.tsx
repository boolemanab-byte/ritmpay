import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { Payment } from "@/lib/types";

interface Props {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

/** Нижнє меню дій з платежем: «Редагувати» / «Видалити» (з підтвердженням). */
export function PaymentMenuSheet({
  visible,
  payment,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) setConfirming(false);
  }, [visible]);

  if (!payment) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />

        <View
          className="w-full max-w-xl self-center rounded-t-[32px] border border-b-0 border-white/10 bg-ink-800 px-6 pt-3"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-white/20" />

          {confirming ? (
            <>
              <Text className="text-xl font-semibold text-mist-100">
                {t.menu.deleteQuestion(payment.title)}
              </Text>
              <Text className="mb-6 mt-1 text-sm text-mist-300">
                {t.menu.deleteWarning}
              </Text>
              <View className="flex-row">
                <Pressable
                  onPress={() => setConfirming(false)}
                  className="mr-3 h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 active:bg-white/10"
                >
                  <Text className="font-semibold text-mist-100">{t.common.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(payment)}
                  className="h-12 flex-1 items-center justify-center rounded-xl border border-red-400/40 bg-red-400/15 active:bg-red-400/25"
                >
                  <Text className="font-semibold text-red-300">{t.common.delete}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text className="mb-4 text-xl font-semibold text-mist-100" numberOfLines={1}>
                {payment.title}
              </Text>

              <Pressable
                onPress={() => onEdit(payment)}
                className="h-14 flex-row items-center rounded-xl px-2 active:bg-white/5"
              >
                <Ionicons name="create-outline" size={20} color={colors.sky[300]} />
                <Text className="ml-3 text-base text-mist-100">{t.common.edit}</Text>
              </Pressable>

              <Pressable
                onPress={() => setConfirming(true)}
                className="h-14 flex-row items-center rounded-xl px-2 active:bg-white/5"
              >
                <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
                <Text className="ml-3 text-base text-red-300">{t.common.delete}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
