import type { Ionicons } from "@expo/vector-icons";
import type { Payment, PaymentCategory, PaymentUnit } from "./types";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface SubcategoryDef {
  key: string;
  label: string;
  icon: IconName;
  /** Одиниця за замовчуванням (для лічильника чи тарифу) */
  unit?: PaymentUnit;
  /** true — лічильник увімкнений завжди й вимкнути його не можна */
  meterAlways?: boolean;
  /** true — замість лічильника одне поле «Тариф, ₴ за місяць» (воно ж і є сумою) */
  monthlyTariff?: boolean;
}

export interface CategoryDef {
  key: PaymentCategory;
  label: string;
  icon: IconName;
  /** Порожньо для «Іншого» — там підкатегорії створює користувач */
  subcategories: SubcategoryDef[];
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    key: "utilities",
    label: "Комуналка",
    icon: "home-outline",
    subcategories: [
      { key: "water", label: "Вода", icon: "water-outline", unit: "м³", meterAlways: true },
      { key: "gas", label: "Газ", icon: "flame-outline", unit: "м³", meterAlways: true },
      { key: "electricity", label: "Світло", icon: "flash-outline", unit: "кВт·год", meterAlways: true },
      { key: "gas_delivery", label: "Доставка газу", icon: "bonfire-outline", unit: "міс.", monthlyTariff: true },
      { key: "intercom", label: "Домофон", icon: "keypad-outline", unit: "міс.", monthlyTariff: true },
      { key: "housing_fee", label: "Квартплата", icon: "business-outline", unit: "міс.", monthlyTariff: true },
      { key: "garbage", label: "Вивіз сміття", icon: "trash-outline", unit: "міс.", monthlyTariff: true },
    ],
  },
  {
    key: "communication",
    label: "Зв’язок",
    icon: "call-outline",
    subcategories: [
      { key: "mobile", label: "Мобільний", icon: "phone-portrait-outline" },
      { key: "internet", label: "Інтернет", icon: "wifi-outline" },
    ],
  },
  {
    key: "rent",
    label: "Оренда",
    icon: "key-outline",
    subcategories: [
      { key: "house", label: "Будинок", icon: "home-outline" },
      { key: "apartment", label: "Квартира", icon: "business-outline" },
      { key: "garage", label: "Гараж", icon: "car-outline" },
      { key: "parking", label: "Паркомісце", icon: "car-sport-outline" },
    ],
  },
  {
    key: "other",
    label: "Інше",
    icon: "receipt-outline",
    subcategories: [],
  },
];

export const CATEGORIES: PaymentCategory[] = CATEGORY_DEFS.map((c) => c.key);

export const UNITS: PaymentUnit[] = ["м²", "м³", "кВт·год", "Гкал", "міс."];

/** Значки, з яких користувач обирає для власної підкатегорії в «Іншому». */
export const CUSTOM_ICONS: IconName[] = [
  "receipt-outline",
  "cash-outline",
  "wallet-outline",
  "card-outline",
  "cart-outline",
  "restaurant-outline",
  "shirt-outline",
  "car-outline",
  "airplane-outline",
  "medkit-outline",
  "fitness-outline",
  "paw-outline",
  "school-outline",
  "book-outline",
  "tv-outline",
  "game-controller-outline",
  "musical-notes-outline",
  "gift-outline",
  "briefcase-outline",
  "construct-outline",
  "shield-checkmark-outline",
  "heart-outline",
];

export const DEFAULT_CUSTOM_ICON: IconName = "receipt-outline";

export function getCategoryDef(category: PaymentCategory): CategoryDef {
  return CATEGORY_DEFS.find((c) => c.key === category) ?? CATEGORY_DEFS[CATEGORY_DEFS.length - 1];
}

export function getSubcategoryDef(
  category: PaymentCategory,
  subcategory: string
): SubcategoryDef | undefined {
  return getCategoryDef(category).subcategories.find((s) => s.key === subcategory);
}

/** Назва підкатегорії для відображення. */
export function subcategoryLabel(p: Pick<Payment, "category" | "subcategory">): string {
  return getSubcategoryDef(p.category, p.subcategory)?.label ?? p.subcategory ?? getCategoryDef(p.category).label;
}

/** Значок платежу: власний для «Іншого», інакше — значок підкатегорії. */
export function paymentIcon(p: Pick<Payment, "category" | "subcategory" | "icon">): IconName {
  if (p.category === "other") {
    return p.icon && p.icon in ICON_LOOKUP ? (p.icon as IconName) : DEFAULT_CUSTOM_ICON;
  }
  return getSubcategoryDef(p.category, p.subcategory)?.icon ?? getCategoryDef(p.category).icon;
}

const ICON_LOOKUP: Record<string, true> = Object.fromEntries(CUSTOM_ICONS.map((i) => [i, true]));

/** Короткий рядок-підказка під сумою на картці. */
export function paymentDetail(p: Payment): string | null {
  if (p.category === "utilities" && p.accountNumber) return `Рах. ${p.accountNumber}`;
  if (p.subcategory === "mobile" && p.phoneNumber) return p.phoneNumber;
  if (p.category === "communication" && p.planName) return p.planName;
  return null;
}
