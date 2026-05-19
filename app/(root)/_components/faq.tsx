"use client";

import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
    { q: t("faq6Q"), a: t("faq6A") },
    { q: t("faq7Q"), a: t("faq7A") },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm font-bold bw-text mb-6">
          <HelpCircle className="w-4 h-4 yellow-accent" />
          <span>{t("faqBadge")}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black bw-text uppercase tracking-tighter mb-4">
          {t("faqTitle1")} <span className="yellow-accent">{t("faqTitle2")}</span>
        </h2>
        <div className="w-20 h-1.5 bg-[#FFB800] mx-auto rounded-full" />
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen
                  ? "border-[#FFB800] shadow-[4px_4px_0px_0px_rgba(255,184,0,1)]"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              } bg-white dark:bg-zinc-900`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors duration-300 ${
                    isOpen ? "bg-[#FFB800] text-black" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="font-black text-sm md:text-base bw-text leading-snug">
                    {item.q}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                    isOpen ? "rotate-180 text-[#FFB800]" : "text-zinc-400"
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1">
                    <div className="ml-10 pl-1 border-l-2 border-[#FFB800]/40">
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed font-medium pl-4">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA at bottom */}
      <div className="text-center mt-12">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4">
          {t("faqCta")}
        </p>
        <a
          href="tel:+998732441333"
          className="inline-flex items-center gap-2 px-6 py-3 bw-button-solid font-black text-sm uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 yellow-accent" />
          {t("faqCtaBtn")}
        </a>
      </div>
    </section>
  );
}
