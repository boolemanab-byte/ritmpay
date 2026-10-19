export type PaymentStatus = "paid" | "pending";

export type PaymentCategory = "utilities" | "communication" | "rent" | "other";

/** Одиниця виміру лічильника або тарифу. */
export type PaymentUnit = "м²" | "м³" | "кВт·год" | "Гкал" | "міс.";

export type CustomFieldType = "text" | "number";

/** Власне поле платежу з категорії «Інше». */
export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  /** Число зберігається як рядок із крапкою ("12.5") */
  value: string;
}

export interface Payment {
  id: string;
  title: string;
  category: PaymentCategory;
  /**
   * Для «Комуналки», «Зв’язку» та «Оренди» — ключ зі списку в categories.ts
   * (water, gas, mobile, apartment…). Для «Іншого» — назва підкатегорії,
   * яку створив користувач.
   */
  subcategory: string;
  status: PaymentStatus;
  /** Сума в гривнях */
  amount: number;
  /** ISO-дата YYYY-MM-DD; null, якщо платіж ще не оплачувався */
  previousPaymentDate: string | null;
  nextPaymentDate: string;
  /** Періодичність у місяцях: 1, 3 або 12 */
  periodMonths: number;
  /** Чи є лічильник (для води, газу й світла — завжди) */
  requiresReadings: boolean;
  /** Одиниця лічильника або тарифу */
  unit?: PaymentUnit;
  /** Тариф, грн за одиницю */
  tariff?: number;
  /** Останнє подане показання лічильника */
  lastReading?: number;

  // --- Комуналка ---
  accountNumber?: string;
  payerName?: string;
  address?: string;
  /** Банківські реквізити / картка, куди платити (також для «Оренди») */
  bankDetails?: string;

  // --- Зв’язок ---
  phoneNumber?: string;
  /** Назва тарифу оператора / інтернет-провайдера */
  planName?: string;

  // --- Інше ---
  /** Назва іконки Ionicons, обрана користувачем */
  icon?: string;
  customFields: CustomField[];
}

/** Дані, які вводить користувач у формі. */
export type PaymentInput = Omit<Payment, "id" | "status" | "previousPaymentDate">;

/** Запис в історії оплат (платіж позначили сплаченим). */
export interface PaymentEvent {
  id: string;
  /** null, якщо платіж пізніше видалили */
  paymentId: string | null;
  title: string;
  category: PaymentCategory;
  subcategory: string;
  icon?: string;
  amount: number;
  /** ISO-дата YYYY-MM-DD */
  paidOn: string;
  createdAt: string;
}

/** Запис в історії показників лічильника. */
export interface ReadingEntry {
  id: string;
  paymentId: string | null;
  title: string;
  category: PaymentCategory;
  subcategory: string;
  icon?: string;
  unit?: PaymentUnit;
  previousValue: number;
  value: number;
  consumption: number;
  tariff: number;
  amount: number;
  /** ISO-дата YYYY-MM-DD */
  readOn: string;
  createdAt: string;
}
