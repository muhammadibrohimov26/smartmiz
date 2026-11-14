"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Calendar, ChevronRight, Globe2, GraduationCap, Home, Search, Sparkles, Star, Trophy, Users, ZoomIn } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { formatCount } from "@/lib/numbers";
import { resultLanguage, resultLevel } from "@/lib/results";
import { cn } from "@/lib/utils";
import TelegramMediaLink from "@/components/shared/telegram-media-link";
import ResultCard, { CertificateViewer, formatDate, languageColor } from "./resultCard";
import { NewsItem } from "@/types";

const OTHER = "other";

// The best result, large (image on the left, details on the right)
function FeaturedResult({ item }: { item: NewsItem }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const exam = t(item.course);
  const score = item.score.trim();
  const level = resultLevel(item).label;
  const language = resultLanguage(item);
  const resultText = item.result && item.result !== item.score ? t(item.result) : "";
  const alt = `${item.name} — ${exam} ${score}`;

  return (
    <article data-reveal className="news-featured">
      {item.image ? (
        <button onClick={() => setOpen(true)} className="news-featured__photo group" aria-label={`${t("newsViewCert")}: ${alt}`}>
          <Image fill sizes="(min-width: 1024px) 560px, 100vw" quality={90} src={item.image} alt={alt} className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-xs font-bold">
            <ZoomIn className="w-3.5 h-3.5" />
            {t("newsViewCert")}
          </span>
        </button>
      ) : (
        <div className="news-featured__photo news-featured__photo--empty" aria-hidden="true">
          <Trophy className="w-20 h-20" strokeWidth={1.3} />
        </div>
      )}
      <div className="news-featured__body">
        <span className="news-featured__badge"><Star className="w-3.5 h-3.5" />{t("newsBest")}</span>
        <h3 className="news-featured__name">{item.name}</h3>
        {(score || level) && (
          <p className="news-featured__score">
            <span>{level || exam}</span>
            {score && <strong>{score}</strong>}
          </p>
        )}
        {resultText && <p className="font-bold text-[#4f9a2b] dark:text-[#8fd062]">{resultText}</p>}
        {item.quote && <p className="news-featured__quote">“{t(item.quote)}”</p>}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {language && (
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${languageColor(language)}`} />
              {t(language)}
            </span>
          )}
          {item.date && (
            <span className="inline-flex items-center gap-1.5" dir="ltr"><Calendar className="w-4 h-4" />{formatDate(item.date)}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {item.image && (
            <button onClick={() => setOpen(true)} className="play-start-btn">
              {t("newsViewCert")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}
          <TelegramMediaLink link={item.telegramLink} media={item.media} />
        </div>
      </div>
      {open && item.image && <CertificateViewer src={item.image} alt={alt} onClose={close} />}
    </article>
  );
}

// "Muvaffaqiyatlar" page (design): hero · search + language filter · the best
// result · the other results · call to action
function NewsPage({ news, studentCount }: { news: NewsItem[]; studentCount: number }) {
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  // Filter groups by language (Ingliz tili, Turk tili, Koreys tili…), most results first
  const groupOf = (item: NewsItem) => resultLanguage(item) || OTHER;
  const counts = new Map<string, number>();
  for (const item of news) counts.set(groupOf(item), (counts.get(groupOf(item)) ?? 0) + 1);
  const groups = Array.from(counts).sort((a, b) => (a[0] === OTHER ? 1 : b[0] === OTHER ? -1 : b[1] - a[1]));
  const groupLabel = (g: string) => (g === OTHER ? t("newsFilterOther") : g === "Koreys tili" ? `${t(g)} (TOPIK)` : t(g));

  const q = query.trim().toLowerCase();
  const shown = news
    .filter((item) => filter === "all" || groupOf(item) === filter)
    .filter((item) => !q || [item.name, item.course, t(item.course), item.score, item.result].some((v) => v?.toLowerCase().includes(q)));
  const [best, ...rest] = shown;

  return (
    <div className="news-v2">
      {/* HERO */}
      <div className="news-hero">
        <div className="news-hero__inner">
          <div className="news-hero__text">
            <nav className="news-crumbs" aria-label="Breadcrumb">
              <Link href="/" className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white"><Home className="w-4 h-4" />{t("navHome")}</Link>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              <span className="text-[#4f9a2b] dark:text-[#8fd062] font-semibold">{t("navNews")}</span>
            </nav>
            <span className="news-hero__badge"><Trophy className="w-4 h-4" />{t("newsBadge")}</span>
            <h1 className="news-hero__title">{t("navNews")}</h1>
            <p className="news-hero__lead">{t("newsDesc")}</p>
            <div className="news-hero__chips">
              {news.length > 0 && <span className="news-chip"><Award className="w-5 h-5" />{t("newsStatCount", { n: news.length })}</span>}
              <span className="news-chip"><Globe2 className="w-5 h-5" />{t("newsChipCerts")}</span>
              <span className="news-chip"><Users className="w-5 h-5" />{t("newsChipReal")}</span>
            </div>
          </div>
          {/* decorative trophy */}
          <div className="news-hero__art" aria-hidden="true">
            <div className="news-hero__circle">
              <GraduationCap className="news-hero__cap" strokeWidth={1.6} />
              <Trophy className="news-hero__trophy" strokeWidth={1.4} />
              <span className="news-hero__ribbon">SMARTMIZ</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <section className="pt-12 pb-6">
        <div className="news-list-head">
          <h2 className="sec-head__title" style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)" }}>{t("newsListHeading")}</h2>
          {news.length > 0 && (
            <label className="news-search">
              <Search className="w-4 h-4 text-zinc-500" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("newsSearch")} aria-label={t("newsSearch")} />
            </label>
          )}
        </div>

        {groups.length > 1 && (
          <div className="course-filters mt-5" role="group">
            {[["all", news.length] as [string, number], ...groups].map(([g, n]) => (
              <button key={g} onClick={() => setFilter(g)} aria-pressed={filter === g} className={cn("course-filter", filter === g && "is-active is-green")}>
                {g !== "all" && <span className={`w-2.5 h-2.5 rounded-full ${languageColor(g === OTHER ? "" : g)}`} />}
                {g === "all" ? t("newsFilterAll") : groupLabel(g)}
                <span className={cn("text-xs font-bold", filter === g ? "opacity-70" : "text-zinc-500")}>{n}</span>
              </button>
            ))}
          </div>
        )}

        {news.length === 0 ? (
          <div className="news-empty">
            <Trophy className="w-10 h-10 mx-auto mb-4 text-[#e0a106]" />
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">{t("newsEmptyTitle")}</h3>
            <p className="text-zinc-600 dark:text-zinc-400">{t("newsEmptyDesc")}</p>
          </div>
        ) : !best ? (
          <p className="py-12 text-center text-zinc-500 font-medium">{t("newsNoMatch")}</p>
        ) : (
          <>
            <FeaturedResult key={best.id} item={best} />
            {rest.length > 0 && (
              <>
                <h3 className="news-more-head">{t("newsMoreHeading")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
                  {rest.map((item) => (
                    <ResultCard key={`${filter}-${item.id}`} item={item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section data-reveal className="news-cta">
        <span className="news-cta__icon"><Sparkles className="w-9 h-9" /></span>
        <div className="flex-1 min-w-0">
          <h2 className="news-cta__title">
            {t("newsCtaTitle1")} <span className="text-[#4f9a2b] dark:text-[#8fd062]">{t("newsCtaTitle2")}</span> {t("newsCtaTitle3")}
          </h2>
          <p className="news-cta__desc">{t("newsCtaDesc", { students: formatCount(studentCount, locale) })}</p>
        </div>
        <Link href="/contact" className="play-start-btn">
          {t("newsCtaBtn")}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </section>
    </div>
  );
}

export default NewsPage;
