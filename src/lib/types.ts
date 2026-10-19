export type PaymentStatus = "paid" | "pending";

export type PaymentCategory =
  | "gas"
  | "water"
  | "electricity"
  | "internet"
  | "rent"
  | "other";

export interface Payment {
  id: string;
  title: string;
  category: PaymentCategory;
  status: PaymentStatus;
  /** Amount in UAH */
  amount: number;
  /** ISO date: YYYY-MM-DD */
  previousPaymentDate: string;
  nextPaymentDate: string;
  /** Metered utilities only */
  requiresReadings: boolean;
  unit?: "m³" | "kWh";
  /** UAH per unit */
  tariff?: number;
  /** Last submitted meter value */
  lastReading?: number;
}
