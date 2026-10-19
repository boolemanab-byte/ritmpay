import type { Payment } from "./types";

// TODO(Supabase): replace with a query, e.g.
// const { data } = await supabase
//   .from("payments")
//   .select("*")
//   .eq("user_id", user.id)
//   .order("next_payment_date");
// Tariffs below are placeholders, not real rates.
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    title: "Gas",
    category: "gas",
    status: "pending",
    amount: 612.4,
    previousPaymentDate: "2026-09-20",
    nextPaymentDate: "2026-10-25",
    requiresReadings: true,
    unit: "m³",
    tariff: 7.96,
    lastReading: 1248,
  },
  {
    id: "2",
    title: "Water",
    category: "water",
    status: "paid",
    amount: 310.0,
    previousPaymentDate: "2026-10-15",
    nextPaymentDate: "2026-11-15",
    requiresReadings: true,
    unit: "m³",
    tariff: 38.5,
    lastReading: 389,
  },
  {
    id: "3",
    title: "Electricity",
    category: "electricity",
    status: "pending",
    amount: 845.2,
    previousPaymentDate: "2026-09-25",
    nextPaymentDate: "2026-10-25",
    requiresReadings: true,
    unit: "kWh",
    tariff: 4.32,
    lastReading: 15420,
  },
  {
    id: "4",
    title: "Internet",
    category: "internet",
    status: "paid",
    amount: 250.0,
    previousPaymentDate: "2026-10-05",
    nextPaymentDate: "2026-11-05",
    requiresReadings: false,
  },
  {
    id: "5",
    title: "Rent",
    category: "rent",
    status: "pending",
    amount: 12000.0,
    previousPaymentDate: "2026-09-25",
    nextPaymentDate: "2026-10-25",
    requiresReadings: false,
  },
];
