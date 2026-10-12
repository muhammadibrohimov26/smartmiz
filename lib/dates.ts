// "12.10.2026 14:05" in Tashkent time (UTC+5, no DST). Not Intl: the server
// (Node) and browsers format "uz" differently, which breaks React hydration.
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function formatTashkent(iso: string) {
  const t = new Date(iso).getTime();
  if (!iso || Number.isNaN(t)) return "";
  const d = new Date(t + TASHKENT_OFFSET_MS);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
