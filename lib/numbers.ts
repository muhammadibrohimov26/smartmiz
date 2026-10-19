// Thousands separators per locale (not Intl: browsers' ICU data for "uz" is inconsistent).
// A non-breaking space keeps "18 000" on one line.
const SEPARATORS: Record<string, string> = { uz: " ", ru: " ", tr: "." };

export function formatCount(n: number, locale: string) {
  const sep = SEPARATORS[locale] ?? ",";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// Course prices are stored in thousands of soʻm (400 = 400 000) and shown in
// full: "400 000 soʻm".
export function formatPrice(thousands: number, locale: string) {
  return formatCount(thousands * 1000, locale);
}
