/** "2026-10-19" -> "19.10.2026" (parsed manually to avoid timezone shifts) */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function formatMoney(value: number): string {
  return `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴`;
}
