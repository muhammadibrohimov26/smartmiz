"use client";

import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowRight, ChevronDown } from "lucide-react";
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
    <section id="faq" className="faq-row scroll-mt-28">
      <h2 className="sec-head__title faq-row__title">{t("faqHeading")}</h2>

      {/* Accordion */}
      <div className="space-y-3 min-w-0">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`faq-item ${isOpen ? "is-open" : ""}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-start"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[15px] md:text-base text-zinc-900 dark:text-white leading-snug">
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

    </section>
  );
}
