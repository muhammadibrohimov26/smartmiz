// Thousands separators per locale (not Intl: browsers' ICU data for "uz" is inconsistent).
// A non-breaking space keeps "18 000" on one line.
const SEPARATORS: Record<string, string> = { uz: " ", ru: " ", tr: "." };

export function formatCount(n: number, locale: string) {
  const sep = SEPARATORS[locale] ?? ",";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// Course prices are stored in thousands of so'm (400 = 400 000).
// Korean has no natural "thousand" unit word here, so it shows the full amount.
const FULL_PRICE_LOCALES = new Set(["ko"]);

export function formatPrice(thousands: number, locale: string) {
  return FULL_PRICE_LOCALES.has(locale) ? formatCount(thousands * 1000, locale) : String(thousands);
}
