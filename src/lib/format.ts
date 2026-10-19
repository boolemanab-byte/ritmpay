/** "2026-10-19" -> "19.10.2026" (розбір вручну, щоб уникнути зсуву часових поясів) */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function formatMoney(value: number): string {
  return `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴`;
}

/** "1 234,5" / "1234.5" -> 1234.5 (NaN, якщо не число) */
export function parseNumber(input: string): number {
  return parseFloat(input.replace(/\s/g, "").replace(",", "."));
}
