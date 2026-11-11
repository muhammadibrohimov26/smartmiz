"use client";

import Typewriter from "@/components/shared/typewriter";
import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowRight, ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  q: string;
  a: string;
  link?: { href: string; label: string };
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
    { q: t("faq7Q"), a: t("faq7A"), link: { href: "/contact", label: t("faqContactLink") } },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-14">
        <div data-reveal="down" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm font-bold bw-text mb-6">
          <HelpCircle className="w-4 h-4 yellow-accent float-slow" />
          <span>{t("faqBadge")}</span>
        </div>
        <h2 className="title-glow text-3xl md:text-5xl font-black bw-text uppercase tracking-tighter mb-4">
          <Typewriter text={t("faqTitle1")} /> <Typewriter text={t("faqTitle2")} delay={t("faqTitle1").length * 45} className="yellow-accent" />
        </h2>
        <div data-reveal="bar" className="w-20 h-1.5 bg-[#FFB800] mx-auto rounded-full" />
      </div>

      {/* Accordion */}
      <div data-reveal-stagger className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              data-reveal
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen
                  ? "border-[#FFB800] shadow-[4px_4px_0px_0px_rgba(255,184,0,1)]"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-violet-400/60 dark:hover:border-violet-400/40 hover:shadow-[0_12px_32px_-18px_rgba(139,92,246,0.5)]"
              } bg-white dark:bg-zinc-900`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-start"
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
                    <div className="ms-4 sm:ms-10 ps-1 border-s-2 border-[#FFB800]/40">
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed font-medium pl-4">
                        {item.a}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link.href}
                          className="inline-flex items-center gap-1.5 mt-1 py-2.5 ps-4 text-sm font-black text-yellow-600 dark:text-yellow-400 hover:underline"
                        >
                          {item.link.label}
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA at bottom */}
      <div data-reveal className="text-center mt-12">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4">
          {t("faqCta")}
        </p>
        <a
          data-magnetic
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
