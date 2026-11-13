"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, DictLocale, Locale } from "@/lib/dictionaries";
import { toCyrillic } from "@/lib/translit";
import { toNewLatin } from "@/lib/newLatin";
import { yearVars } from "@/lib/years";
import { usePathname } from "next/navigation";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof dictionaries["uz"] | string, vars?: Record<string, string | number>) => string;
}

// Özbekça (uzn) and Ўзбекча (uzc) use the Uzbek dictionary, converted
const dictFor = (locale: Locale) => dictionaries[(locale === "uzc" || locale === "uzn" ? "uz" : locale) as DictLocale] as Record<string, string>;
const convert = (locale: Locale, text: string) => (locale === "uzc" ? toCyrillic(text) : locale === "uzn" ? toNewLatin(text) : text);
const isLocale = (value: string | null): value is Locale => !!value && (value === "uzc" || value === "uzn" || value in dictionaries);

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "pageTitleHome",
  "/about": "pageTitleAbout",
  "/news": "pageTitleNews",
  "/contact": "pageTitleContact",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz");

  // Local Storage to persist language
  useEffect(() => {
    const savedLocale = localStorage.getItem("app-locale");
    if (isLocale(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Sync <html lang/dir> with the active locale (Arabic is right-to-left)
  useEffect(() => {
    document.documentElement.lang = locale === "uzc" ? "uz-Cyrl" : locale === "uzn" ? "uz-Latn" : locale;
    document.documentElement.dir = "ltr";
  }, [locale]);

  // Translate the browser tab title. The server only knows the Uzbek title (used for SEO),
  // since the locale lives in localStorage.
  const pathname = usePathname();
  useEffect(() => {
    const key = PAGE_TITLE_KEYS[pathname];
    const title = key && dictFor(locale)[key];
    if (title) document.title = convert(locale, title);
  }, [locale, pathname]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("app-locale", newLocale);
  };

  const t = (key: string, extra?: Record<string, string | number>): string => {
    const dict = dictFor(locale);
    // Data (e.g. Firestore) may use ‘ ’ ʻ ʼ where the dictionary keys use '
    const found = dict[key] || dict[key.replace(/[‘’ʻʼ`]/g, "'")] || key; // fallback: the key itself
    // Özbekça / Ўзбекча: everything Uzbek (dictionary and admin data passed through t) converted
    const text = convert(locale, found);
    // Fill {years}, {yearsWord}, {foundedYear}, {currentYear} and extra vars (e.g. {students})
    const vars: Record<string, string | number> = { ...yearVars(locale), ...extra };
    return text.replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match));
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
