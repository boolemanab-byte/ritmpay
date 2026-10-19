import { supabase } from "./supabase";
import type {
  PaymentCategory,
  PaymentEvent,
  PaymentUnit,
  ReadingEntry,
} from "./types";

interface EventRow {
  id: string;
  payment_id: string | null;
  title: string;
  category: string;
  subcategory: string | null;
  icon: string | null;
  amount: number | string;
  paid_on: string;
  created_at: string;
}

interface ReadingRow {
  id: string;
  payment_id: string | null;
  title: string;
  category: string;
  subcategory: string | null;
  icon: string | null;
  unit: string | null;
  previous_value: number | string;
  value: number | string;
  consumption: number | string;
  tariff: number | string;
  amount: number | string;
  read_on: string;
  created_at: string;
}

const toEvent = (r: EventRow): PaymentEvent => ({
  id: r.id,
  paymentId: r.payment_id,
  title: r.title,
  category: r.category as PaymentCategory,
  subcategory: r.subcategory ?? "",
  icon: r.icon ?? undefined,
  amount: Number(r.amount),
  paidOn: r.paid_on,
  createdAt: r.created_at,
});

const toReading = (r: ReadingRow): ReadingEntry => ({
  id: r.id,
  paymentId: r.payment_id,
  title: r.title,
  category: r.category as PaymentCategory,
  subcategory: r.subcategory ?? "",
  icon: r.icon ?? undefined,
  unit: (r.unit ?? undefined) as PaymentUnit | undefined,
  previousValue: Number(r.previous_value),
  value: Number(r.value),
  consumption: Number(r.consumption),
  tariff: Number(r.tariff),
  amount: Number(r.amount),
  readOn: r.read_on,
  createdAt: r.created_at,
});

export async function fetchPaymentEvents(): Promise<PaymentEvent[]> {
  const { data, error } = await supabase
    .from("payment_events")
    .select("*")
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as EventRow[]).map(toEvent);
}

export async function fetchReadingHistory(): Promise<ReadingEntry[]> {
  const { data, error } = await supabase
    .from("reading_history")
    .select("*")
    .order("read_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReadingRow[]).map(toReading);
}

/** Змінює показник; сервер перераховує споживання, суму й сусідній запис. */
export async function updateReadingValue(id: string, value: number): Promise<void> {
  const { error } = await supabase.rpc("update_reading", {
    p_reading_id: id,
    p_value: value,
  });
  if (error) throw error;
}
