import { addDays, addMonths } from "./dates";
import { plural, t } from "./i18n";
import type { Payment, PaymentEvent } from "./types";

type Period = Pick<Payment, "periodMonths" | "periodWeeks">;

/** Підпис періодичності: «Щомісяця», «Кожні 4 тижні»… */
export function periodLabel(p: Period): string {
  if (p.periodWeeks) return t.periodWeeks(p.periodWeeks);
  return t.periods[p.periodMonths] ?? "";
}

/**
 * Дата k-го періоду від базової дати (k = 0 — сама база).
 * Рахуємо завжди від бази, а не крок за кроком, щоб 31-ше число
 * не «з’їжджало» на 28-ме назавжди.
 */
export function dueDate(p: Period, base: string, k: number): string {
  if (p.periodWeeks) return addDays(base, p.periodWeeks * 7 * k);
  return addMonths(base, p.periodMonths * k);
}

/** "2026-10-19" -> "2026-10" */
export const monthKey = (iso: string) => iso.slice(0, 7);

export function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = m - 1 + delta;
  const year = y + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** "2026-10" -> "жовтень" */
export const monthName = (key: string) => t.months[Number(key.slice(5, 7)) - 1] ?? "";

/** "2026-10-25" або "2026-10" -> "Жовтень 2026" */
export function monthYearLabel(isoOrKey: string): string {
  const name = monthName(isoOrKey);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${isoOrKey.slice(0, 4)}`;
}

/** Усі дати платежу в проміжку [from, to] (включно), рахуючи від наступної дати. */
export function occurrences(p: Payment, from: string, to: string): string[] {
  const result: string[] = [];
  for (let k = 0; k < 600; k++) {
    const d = dueDate(p, p.nextPaymentDate, k);
    if (d > to) break;
    if (d >= from) result.push(d);
  }
  return result;
}

export interface DashboardSummary {
  monthKey: string;
  nextMonthKey: string;
  /** Ще треба сплатити цього місяця (від сьогодні до кінця місяця) */
  toPay: number;
  toPayCount: number;
  /** Уже сплачено цього місяця (за датою оплати) */
  paid: number;
  /** Скільки буде до сплати наступного місяця */
  nextMonth: number;
  nextMonthCount: number;
  /** Прострочені платежі (дата оплати минула) */
  debt: number;
  debtCount: number;
}

export function summarize(
  payments: Payment[],
  events: PaymentEvent[],
  today: string
): DashboardSummary {
  const cur = monthKey(today);
  const next = shiftMonthKey(cur, 1);
  const curEnd = `${cur}-31`; // порівняння рядків: будь-який день місяця ≤ "-31"
  const nextStart = `${next}-01`;
  const nextEnd = `${next}-31`;

  const s: DashboardSummary = {
    monthKey: cur,
    nextMonthKey: next,
    toPay: 0,
    toPayCount: 0,
    paid: 0,
    nextMonth: 0,
    nextMonthCount: 0,
    debt: 0,
    debtCount: 0,
  };

  for (const p of payments) {
    // Борг: усі періоди, дата яких уже минула
    const overdue = occurrences(p, "0000-01-01", dayBefore(today)).length;
    if (overdue > 0) {
      s.debt += overdue * p.amount;
      s.debtCount += 1;
    }

    const rest = occurrences(p, today, curEnd);
    if (rest.length > 0) {
      s.toPay += rest.length * p.amount;
      s.toPayCount += 1;
    }

    const upcoming = occurrences(p, nextStart, nextEnd);
    if (upcoming.length > 0) {
      s.nextMonth += upcoming.length * p.amount;
      s.nextMonthCount += 1;
    }
  }

  for (const e of events) {
    if (monthKey(e.paidOn) === cur) s.paid += e.amount;
  }
  return s;
}

function dayBefore(iso: string): string {
  return addDays(iso, -1);
}

export const paymentsWord = (n: number) => plural(n, ["платіж", "платежі", "платежів"]);

export function isOverdue(p: Payment, today: string): boolean {
  return p.status === "pending" && p.nextPaymentDate < today;
}

export interface PayOption {
  /** Скільки періодів буде оплачено, якщо обрати цей пункт */
  periods: number;
  /** Дата, на яку припадає цей період */
  due: string;
  overdue: boolean;
  current: boolean;
}

export interface PayPlan {
  options: PayOption[];
  /** Індекс пункту, обраного за замовчуванням */
  defaultIndex: number;
}

/**
 * Пункти вибору «за який період платити»: від найстарішого неоплаченого
 * і ще кілька періодів наперед. За замовчуванням — поточний місяць
 * (або найближчий неоплачений, якщо поточний уже закритий).
 */
export function payPlan(p: Payment, today: string): PayPlan {
  const cur = monthKey(today);

  let upToCurrent = 0;
  while (
    upToCurrent < 60 &&
    monthKey(dueDate(p, p.nextPaymentDate, upToCurrent)) <= cur
  ) {
    upToCurrent++;
  }

  const ahead = p.periodWeeks ? 13 : p.periodMonths === 1 ? 12 : p.periodMonths === 3 ? 4 : 3;
  const total = Math.min(upToCurrent + ahead, 72);

  const options: PayOption[] = [];
  for (let k = 0; k < total; k++) {
    const due = dueDate(p, p.nextPaymentDate, k);
    options.push({
      periods: k + 1,
      due,
      overdue: due < today,
      current: monthKey(due) === cur,
    });
  }
  return { options, defaultIndex: Math.max(upToCurrent - 1, 0) };
}
