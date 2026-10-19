import { subcategoryLabel } from "./categories";
import { formatDate, formatMoney } from "./format";
import { t } from "./i18n";
import type { Payment, ReadingEntry } from "./types";

export interface InfoRow {
  key: string;
  label: string;
  value: string;
}

/** Усі додаткові дані платежу, введені при створенні (для картки й екрана платежу). */
export function paymentInfoRows(p: Payment): InfoRow[] {
  const rows: InfoRow[] = [];
  const add = (key: string, label: string, value: string | undefined) => {
    if (value && value.trim() !== "") rows.push({ key, label, value: value.trim() });
  };

  add("period", t.details.period, t.periods[p.periodMonths]);
  add("account", t.form.accountNumber, p.accountNumber);
  add("payer", t.form.payerName, p.payerName);
  add("address", t.form.address, p.address);
  add("phone", t.form.phone, p.phoneNumber);
  add("plan", t.form.plan, p.planName);

  if (p.tariff !== undefined) {
    add(
      "tariff",
      t.details.tariff,
      p.unit === "міс."
        ? `${formatMoney(p.tariff)} / міс.`
        : `${p.tariff.toFixed(2)} ₴ / ${p.unit ?? ""}`.trim()
    );
  }
  if (p.requiresReadings && p.lastReading !== undefined) {
    add("reading", t.details.lastReading, `${p.lastReading} ${p.unit ?? ""}`.trim());
  }

  add("bank", p.category === "rent" ? t.details.rentDetails : t.form.bankDetails, p.bankDetails);

  for (const f of p.customFields) {
    add(`cf-${f.id}`, f.label, f.value);
  }
  return rows;
}

/** Рядки з датами, що показуються лише на екрані платежу. */
export function paymentMetaRows(p: Payment): InfoRow[] {
  return [
    { key: "cat", label: t.details.category, value: subcategoryLabel(p) },
    { key: "prev", label: t.card.previous, value: formatDate(p.previousPaymentDate) },
    { key: "next", label: t.card.next, value: formatDate(p.nextPaymentDate) },
  ];
}

/**
 * «Показники не передано»: є лічильник, платіж очікує,
 * а після попередньої оплати жодного показника ще не подавали.
 */
export function needsReadings(p: Payment, readings: ReadingEntry[]): boolean {
  if (!p.requiresReadings || p.status !== "pending") return false;
  const since = p.previousPaymentDate;
  return !readings.some(
    (r) => r.paymentId === p.id && (since === null || r.readOn > since)
  );
}
