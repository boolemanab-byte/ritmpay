import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { todayIso } from "@/lib/dates";
import { dueDate } from "@/lib/schedule";
import { t } from "@/lib/i18n";
import {
  fetchPayments,
  insertPayment,
  patchPayment,
  removePayment,
  sendReading,
  setPaid,
} from "@/lib/paymentsApi";
import {
  fetchPaymentEvents,
  fetchReadingHistory,
  updateReadingValue,
} from "@/lib/historyApi";
import type { Payment, PaymentEvent, PaymentInput, ReadingEntry } from "@/lib/types";

interface PaymentsContextValue {
  payments: Payment[];
  /** Історія оплат (найновіші першими) */
  events: PaymentEvent[];
  /** Історія показників (найновіші першими) */
  readings: ReadingEntry[];
  /** true, доки вантажиться перший список після входу */
  loading: boolean;
  /** Текст останньої помилки зв’язку з сервером */
  error: string | null;
  clearError: () => void;
  getPayment: (id: string) => Payment | undefined;
  /** Додавання/редагування кидають помилку — форма її показує */
  addPayment: (input: PaymentInput) => Promise<void>;
  updatePayment: (id: string, input: PaymentInput) => Promise<void>;
  /** Нижче — «оптимістичні» дії: інтерфейс оновлюється одразу, при збої відкочується */
  deletePayment: (id: string) => Promise<void>;
  /** periods — скільки періодів оплачується за раз (>1 — оплата наперед або погашення боргу) */
  markPaid: (id: string, periods?: number) => Promise<void>;
  submitReadings: (id: string, reading: number, total: number) => Promise<void>;
  /** Редагування показника з історії; кидає помилку — її показує шторка */
  editReading: (readingId: string, value: number) => Promise<void>;
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<Payment[]>([]);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [readings, setReadings] = useState<ReadingEntry[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const loading = userId !== null && loadedFor !== userId;

  // Завантажити платежі при вході, очистити при виході
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setEvents([]);
      setReadings([]);
      setLoadedFor(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [data, evts, rds] = await Promise.all([
          fetchPayments(),
          fetchPaymentEvents().catch((e) => {
            console.warn("Load payment events:", e);
            return [] as PaymentEvent[];
          }),
          fetchReadingHistory().catch((e) => {
            console.warn("Load reading history:", e);
            return [] as ReadingEntry[];
          }),
        ]);
        if (!cancelled) {
          setItems(data);
          setEvents(evts);
          setReadings(rds);
          setError(null);
        }
      } catch (e) {
        console.warn("Load payments:", e);
        if (!cancelled) setError(t.errors.load);
      } finally {
        if (!cancelled) setLoadedFor(userId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /** Тихе перезавантаження списку (після невдалої оптимістичної дії). */
  const refresh = useCallback(async () => {
    try {
      setItems(await fetchPayments());
    } catch (e) {
      console.warn("Refresh payments:", e);
    }
  }, []);

  /** Підтягує історію після дії, яка додала в неї запис. */
  const refreshHistory = useCallback(async () => {
    try {
      const [evts, rds] = await Promise.all([fetchPaymentEvents(), fetchReadingHistory()]);
      setEvents(evts);
      setReadings(rds);
    } catch (e) {
      console.warn("Refresh history:", e);
    }
  }, []);

  // Сплачений платіж знову стає «Очікує», коли настає його дата;
  // список сортуємо за найближчою датою.
  // TODO: це лише відображення; за потреби оновлювати статус на сервері (pg_cron).
  const payments = useMemo(() => {
    const today = todayIso();
    return items
      .map((p) =>
        p.status === "paid" && p.nextPaymentDate <= today
          ? { ...p, status: "pending" as const }
          : p
      )
      .sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate));
  }, [items]);

  const getPayment = useCallback(
    (id: string) => payments.find((p) => p.id === id),
    [payments]
  );

  const addPayment = useCallback(async (input: PaymentInput) => {
    const created = await insertPayment(input);
    setItems((prev) => [...prev, created]);
  }, []);

  const updatePayment = useCallback(async (id: string, input: PaymentInput) => {
    const old = itemsRef.current.find((p) => p.id === id);
    const updated = await patchPayment(id, input, !!old?.periodWeeks && !input.periodWeeks);
    setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const deletePayment = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((p) => p.id !== id));
      // Історія лишається, але вже не прив’язана до видаленого платежу
      setEvents((prev) => prev.map((e) => (e.paymentId === id ? { ...e, paymentId: null } : e)));
      setReadings((prev) => prev.map((r) => (r.paymentId === id ? { ...r, paymentId: null } : r)));
      try {
        await removePayment(id);
      } catch (e) {
        console.warn("Delete payment:", e);
        setError(t.errors.save);
        await refresh();
      }
    },
    [refresh]
  );

  const markPaid = useCallback(
    async (id: string, periods = 1) => {
      const p = itemsRef.current.find((x) => x.id === id);
      if (!p) return;
      const count = Math.max(1, Math.floor(periods));
      const previous = todayIso();
      const base = p.nextPaymentDate;
      const finalNext = dueDate(p, base, count);
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, status: "paid", previousPaymentDate: previous, nextPaymentDate: finalNext }
            : x
        )
      );
      try {
        // Кожен оплачений період — окремий запис в історії
        for (let i = 1; i <= count; i++) {
          await setPaid(id, previous, dueDate(p, base, i));
        }
        await refreshHistory();
      } catch (e) {
        console.warn("Mark paid:", e);
        setError(t.errors.save);
        await refresh();
        await refreshHistory();
      }
    },
    [refresh, refreshHistory]
  );

  const submitReadings = useCallback(
    async (id: string, reading: number, total: number) => {
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, lastReading: reading, amount: Math.round(total * 100) / 100, status: "pending" }
            : p
        )
      );
      try {
        // TODO(OCR): зберегти фото лічильника в Supabase Storage і прив’язати
        // до запису в meter_readings (додати колонку photo_path).
        await sendReading(id, reading);
        await refreshHistory();
      } catch (e) {
        console.warn("Submit readings:", e);
        setError(t.errors.save);
        await refresh();
      }
    },
    [refresh, refreshHistory]
  );

  const editReading = useCallback(
    async (readingId: string, value: number) => {
      await updateReadingValue(readingId, value);
      await Promise.all([refresh(), refreshHistory()]);
    },
    [refresh, refreshHistory]
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      payments,
      events,
      readings,
      loading,
      error,
      clearError,
      getPayment,
      addPayment,
      updatePayment,
      deletePayment,
      markPaid,
      submitReadings,
      editReading,
    }),
    [
      payments,
      events,
      readings,
      editReading,
      loading,
      error,
      clearError,
      getPayment,
      addPayment,
      updatePayment,
      deletePayment,
      markPaid,
      submitReadings,
    ]
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error("usePayments must be used inside <PaymentsProvider>");
  return ctx;
}
