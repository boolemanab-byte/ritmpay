import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { CustomField, CustomFieldType } from "@/lib/types";

export const newFieldId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

interface Props {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

/** Редактор власних текстових і числових полів («Інше»). */
export function CustomFieldsEditor({ fields, onChange }: Props) {
  const patch = (id: string, changes: Partial<CustomField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...changes } : f)));

  const setType = (id: string, type: CustomFieldType) =>
    patch(id, { type, value: "" });

  return (
    <View>
      {fields.map((f) => (
        <View
          key={f.id}
          className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row">
              <Chip
                label={t.form.fieldText}
                selected={f.type === "text"}
                onPress={() => setType(f.id, "text")}
              />
              <Chip
                label={t.form.fieldNumber}
                selected={f.type === "number"}
                onPress={() => setType(f.id, "number")}
              />
            </View>
            <Pressable
              onPress={() => onChange(fields.filter((x) => x.id !== f.id))}
              accessibilityLabel={t.form.removeField}
              hitSlop={8}
              className="mb-2 h-9 w-9 items-center justify-center rounded-full active:bg-white/10"
            >
              <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
            </Pressable>
          </View>

          <TextField
            label={t.form.fieldLabel}
            icon="text-outline"
            autoCapitalize="sentences"
            value={f.label}
            onChangeText={(v) => patch(f.id, { label: v })}
          />
          <TextField
            label={t.form.fieldValue}
            icon={f.type === "number" ? "calculator-outline" : "document-text-outline"}
            keyboardType={f.type === "number" ? "decimal-pad" : "default"}
            autoCapitalize="sentences"
            value={f.value}
            onChangeText={(v) => patch(f.id, { value: v })}
          />
        </View>
      ))}

      <Pressable
        onPress={() =>
          onChange([...fields, { id: newFieldId(), label: "", type: "text", value: "" }])
        }
        className="h-11 flex-row items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10 active:bg-sky-400/20"
      >
        <Ionicons name="add-outline" size={16} color={colors.sky[300]} />
        <Text className="ml-1 text-sm font-semibold text-sky-300">
          {t.form.addField}
        </Text>
      </Pressable>
    </View>
  );
}
