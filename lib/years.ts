// Smartmiz was founded in 2016; "years of experience" is derived from it
// so the site never needs a manual update on New Year.
export const FOUNDING_YEAR = 2016;

export function currentYear() {
  return new Date().getFullYear();
}

export function yearsActive() {
  return currentYear() - FOUNDING_YEAR;
}

// The word "years" after a number, where the language inflects it.
const YEAR_WORDS: Record<string, Partial<Record<Intl.LDMLPluralRule, string>>> = {
  ru: { one: "год", few: "года", many: "лет", other: "года" },
  ar: { zero: "سنة", one: "سنة", two: "سنتان", few: "سنوات", many: "سنة", other: "سنة" },
};

export function yearsWord(n: number, locale: string) {
  const words = YEAR_WORDS[locale];
  if (!words) return "";
  return words[new Intl.PluralRules(locale).select(n)] ?? words.other ?? "";
}

// Variables for dictionary strings: {years}, {yearsWord}, {foundedYear}, {currentYear}
export function yearVars(locale: string) {
  const years = yearsActive();
  return {
    years,
    yearsWord: yearsWord(years, locale),
    foundedYear: FOUNDING_YEAR,
    currentYear: currentYear(),
  };
}
