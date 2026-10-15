"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, Quote, Trophy, X, ZoomIn } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import TelegramMediaLink from "@/components/shared/telegram-media-link";
import { NewsItem } from "@/types";

// "15.10.2026" from "2026-10-15" — not Intl: server and browsers format "uz"
// dates differently, which breaks hydration
function formatDate(date: string) {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : date;
}

const examColors: Record<string, string> = {
  IELTS: "bg-blue-600",
  TOPIK: "bg-red-600",
  CEFR: "bg-purple-600",
  "EPS-TOPIK": "bg-emerald-600",
};

export const examColor = (course: string) => examColors[course.trim().toUpperCase()] ?? "bg-zinc-800";

// The certificate full screen, so visitors can read it themselves
function CertificateViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const { t } = useTranslation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <button
        onClick={onClose}
        aria-label={t("close")}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
      >
        <X className="w-6 h-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default function ResultCard({ item }: { item: NewsItem }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const exam = t(item.course);
  const score = item.score.trim();
  // The admin form's "Natija matni" — shown when it adds something to the score
  const resultText = item.result && item.result !== item.score ? t(item.result) : "";
  const alt = `${item.name} — ${exam} ${score}`;

  const scoreBadge = score && (
    <div className="flex items-baseline gap-2 px-4 py-2 rounded-2xl bg-[#FFB800] text-black shadow-lg">
      <span className="text-xs font-black uppercase tracking-wider">{exam}</span>
      <span className="text-3xl font-black leading-none">{score}</span>
    </div>
  );

  return (
    <article className="group bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(255,184,0,1)] transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {item.image ? (
        <button
          onClick={() => setOpen(true)}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 text-left"
          aria-label={`${t("newsViewCert")}: ${alt}`}
        >
          <Image
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
            src={item.image}
            alt={alt}
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute left-4 bottom-4">{scoreBadge}</div>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-xs font-bold">
            <ZoomIn className="w-3.5 h-3.5" />
            {t("newsViewCert")}
          </span>
        </button>
      ) : (
        score && (
          <div className="flex items-center justify-center py-10 bg-zinc-50 dark:bg-zinc-950 border-b-4 border-zinc-900 dark:border-zinc-800">
            {scoreBadge}
          </div>
        )
      )}

      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-lg bw-text leading-tight">{item.name}</h3>
            {resultText && (
              <p className="flex items-center gap-1.5 mt-1 font-bold text-sm text-[#FFB800]">
                <Trophy className="w-4 h-4 shrink-0" />
                {resultText}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wider ${examColor(item.course)}`}>
              {exam}
            </span>
            {item.date && (
              <span className="flex items-center gap-1 text-zinc-400 text-xs" dir="ltr">
                <Calendar className="w-3 h-3" />
                {formatDate(item.date)}
              </span>
            )}
          </div>
        </div>

        {item.quote && (
          <blockquote className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <Quote className="w-4 h-4 text-[#FFB800] mb-2 opacity-60" />
            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-medium italic whitespace-pre-line">{t(item.quote)}</p>
          </blockquote>
        )}

        <TelegramMediaLink link={item.telegramLink} media={item.media} />
      </div>

      {open && item.image && <CertificateViewer src={item.image} alt={alt} onClose={() => setOpen(false)} />}
    </article>
  );
}
