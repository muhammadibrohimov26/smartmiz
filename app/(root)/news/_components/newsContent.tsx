"use client";

import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatCount } from "@/lib/numbers";
import { resultLanguage } from "@/lib/results";
import { cn } from "@/lib/utils";
import ResultCard, { languageColor } from "./resultCard";
import { NewsItem } from "@/types";

const OTHER = "other";

function NewsPage({ news, studentCount }: { news: NewsItem[]; studentCount: number }) {
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState("all");
  // Filter groups by language (Ingliz tili, Turk tili, Koreys tili…), most results first
  const groupOf = (item: NewsItem) => resultLanguage(item) || OTHER;
  const counts = new Map<string, number>();
  for (const item of news) counts.set(groupOf(item), (counts.get(groupOf(item)) ?? 0) + 1);
  const groups = Array.from(counts).sort((a, b) => (a[0] === OTHER ? 1 : b[0] === OTHER ? -1 : b[1] - a[1]));
  const shown = filter === "all" ? news : news.filter((item) => groupOf(item) === filter);
  const groupLabel = (g: string) => (g === OTHER ? t("newsFilterOther") : g === "Koreys tili" ? `${t(g)} (TOPIK)` : t(g));

  return (
    <div className="mt-28 md:mt-32 max-w-6xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm font-bold bw-text mb-6">
          <Sparkles className="w-4 h-4 yellow-accent animate-pulse" />
          <span>{t("newsBadge")}</span>
        </div>
        <h1 className="text-[clamp(1.75rem,8.5vw,2.25rem)] sm:text-5xl md:text-6xl font-black bw-text tracking-tighter uppercase mb-4">
          {t("newsTitle1")} <span className="yellow-accent">{t("newsTitle2")}</span>
        </h1>
        <div className="w-24 h-1.5 bg-[#FFB800] mx-auto rounded-full mb-6" />
        <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg font-medium leading-relaxed">
          {t("newsDesc")}
        </p>
      </div>

      {/* EMPTY STATE */}
      {news.length === 0 && (
        <div className="max-w-xl mx-auto mb-16 p-6 sm:p-10 text-center bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl">
          <Trophy className="w-10 h-10 mx-auto mb-4 yellow-accent" />
          <h2 className="text-2xl font-black bw-text uppercase tracking-tight mb-2">{t("newsEmptyTitle")}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">{t("newsEmptyDesc")}</p>
        </div>
      )}

      {/* FILTER BY LANGUAGE — with the number of published results in each */}
      {groups.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12" role="group">
          {[["all", news.length] as [string, number], ...groups].map(([g, n]) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              aria-pressed={filter === g}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl border-2 font-black text-sm transition-colors",
                filter === g
                  ? "bg-[#FFB800] border-[#FFB800] text-black"
                  : "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-800 bw-text hover:border-[#FFB800]"
              )}
            >
              {g !== "all" && <span className={`w-2.5 h-2.5 rounded-full ${languageColor(g === OTHER ? "" : g)}`} />}
              {g === "all" ? t("newsFilterAll") : groupLabel(g)}
              <span className={cn("text-xs font-bold", filter === g ? "text-black/60" : "text-zinc-500")}>{n}</span>
            </button>
          ))}
        </div>
      )}

      {/* RESULTS — best first (lib/results.ts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {shown.map((item) => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
        <h2 className="text-[clamp(1.4rem,6.6vw,1.875rem)] md:text-4xl font-black bw-text uppercase tracking-tighter mb-4 [overflow-wrap:anywhere]">
          {t("newsCtaTitle1")} <span className="yellow-accent">{t("newsCtaTitle2")}</span> {t("newsCtaTitle3")}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 max-w-xl mx-auto">
          {t("newsCtaDesc", { students: formatCount(studentCount, locale) })}
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bw-button-solid font-black text-lg uppercase tracking-wider"
        >
          {t("newsCtaBtn")}
          <Sparkles className="w-5 h-5 yellow-accent" />
        </Link>
      </div>

    </div>
  );
}

export default NewsPage;
