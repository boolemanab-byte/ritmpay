import { supabase } from "./supabase";
import type { CustomField, Payment, PaymentCategory, PaymentInput, PaymentUnit } from "./types";

/** Рядок таблиці public.payments (snake_case). */
interface PaymentRow {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  status: "paid" | "pending";
  amount: number | string;
  previous_payment_date: string | null;
  next_payment_date: string;
  period_months: number;
  /** Колонка з’являється після міграції supabase/add_period_weeks.sql */
  period_weeks?: number | null;
  requires_readings: boolean;
  unit: string | null;
  tariff: number | string | null;
  last_reading: number | string | null;
  account_number: string | null;
  payer_name: string | null;
  address: string | null;
  bank_details: string | null;
  phone_number: string | null;
  plan_name: string | null;
  icon: string | null;
  custom_fields: CustomField[] | null;
}

const toPayment = (r: PaymentRow): Payment => ({
  id: r.id,
  title: r.title,
  category: r.category as PaymentCategory,
  subcategory: r.subcategory ?? "",
  status: r.status,
  amount: Number(r.amount),
  previousPaymentDate: r.previous_payment_date,
  nextPaymentDate: r.next_payment_date,
  periodMonths: r.period_months,
  periodWeeks: r.period_weeks ?? undefined,
  requiresReadings: r.requires_readings,
  unit: (r.unit ?? undefined) as PaymentUnit | undefined,
  tariff: r.tariff == null ? undefined : Number(r.tariff),
  lastReading: r.last_reading == null ? undefined : Number(r.last_reading),
  accountNumber: r.account_number ?? undefined,
  payerName: r.payer_name ?? undefined,
  address: r.address ?? undefined,
  bankDetails: r.bank_details ?? undefined,
  phoneNumber: r.phone_number ?? undefined,
  planName: r.plan_name ?? undefined,
  icon: r.icon ?? undefined,
  customFields: Array.isArray(r.custom_fields) ? r.custom_fields : [],
});

// user_id заповнюється на сервері (default auth.uid()), тож клієнт його не передає.
//
// period_weeks додаємо лише коли воно потрібне: так застосунок працює й до міграції,
// а «4 тижні» стають доступні після неї. clearWeeks — коли платіж переводять
// з тижневої періодичності назад на місячну.
const toRow = (input: PaymentInput, clearWeeks = false) => ({
  ...(input.periodWeeks
    ? { period_weeks: input.periodWeeks }
    : clearWeeks
      ? { period_weeks: null }
      : {}),
  title: input.title,
  category: input.category,
  subcategory: input.subcategory,
  amount: input.amount,
  next_payment_date: input.nextPaymentDate,
  period_months: input.periodMonths,
  requires_readings: input.requiresReadings,
  unit: input.unit ?? null,
  tariff: input.tariff ?? null,
  last_reading: input.lastReading ?? null,
  account_number: input.accountNumber ?? null,
  payer_name: input.payerName ?? null,
  address: input.address ?? null,
  bank_details: input.bankDetails ?? null,
  phone_number: input.phoneNumber ?? null,
  plan_name: input.planName ?? null,
  icon: input.icon ?? null,
  custom_fields: input.customFields,
});

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("next_payment_date", { ascending: true });
  if (error) throw error;
  return (data as PaymentRow[]).map(toPayment);
}

export async function insertPayment(input: PaymentInput): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  return toPayment(data as PaymentRow);
}

export async function patchPayment(
  id: string,
  input: PaymentInput,
  clearWeeks = false
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update(toRow(input, clearWeeks))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toPayment(data as PaymentRow);
}

export async function removePayment(id: string): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
}

/** Позначає платіж оплаченим і додає запис в історію (SQL-функція record_payment_paid). */
export async function setPaid(
  id: string,
  previousPaymentDate: string,
  nextPaymentDate: string
): Promise<void> {
  const { error } = await supabase.rpc("record_payment_paid", {
    p_payment_id: id,
    p_paid_on: previousPaymentDate,
    p_next: nextPaymentDate,
  });
  if (error) throw error;
}

/** Зберігає показник в історію й оновлює платіж (SQL-функція record_reading). */
export async function sendReading(id: string, value: number): Promise<void> {
  const { error } = await supabase.rpc("record_reading", {
    p_payment_id: id,
    p_value: value,
  });
  if (error) throw error;
}
