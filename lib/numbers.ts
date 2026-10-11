// Thousands separators per locale (not Intl: browsers' ICU data for "uz" is inconsistent).
// A non-breaking space keeps "18 000" on one line.
const SEPARATORS: Record<string, string> = { uz: " ", ru: " ", tr: "." };

export function formatCount(n: number, locale: string) {
  const sep = SEPARATORS[locale] ?? ",";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
