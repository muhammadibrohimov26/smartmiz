"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronRight, FileCheck2, GraduationCap, Monitor, X } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { Price } from "@/types";
import CourseQuiz, { QuizStart } from "./courseQuiz";
import VocabGame from "./vocabGame";

// Two compact cards side by side (home page): "Qaysi kurs siz uchun?" with
// three goals, and the English word game. Each opens the full quiz / game
// in a dialog; a goal pre-answers the quiz's first question(s).

type Open = { kind: "quiz"; start: QuizStart } | { kind: "game" } | null;

function Dialog({ onClose, label, children }: { onClose: () => void; label: string; children: React.ReactNode }) {
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl max-h-[92svh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white dark:bg-zinc-900 p-5 pt-12 sm:p-10 shadow-2xl animate-in slide-in-from-bottom-6 duration-300"
      >
        <button
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-3 end-3 grid place-items-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function PlayCards({ courses }: { courses: Price[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Open>(null);
  const close = useCallback(() => setOpen(null), []);

  const goals: { label: string; icon: React.ReactNode; start: QuizStart }[] = [
    { label: t("playQuizLang"), icon: <GraduationCap className="w-5 h-5" />, start: { direction: "language" } },
    { label: t("playQuizExam"), icon: <FileCheck2 className="w-5 h-5" />, start: { direction: "language", goal: "certificate" } },
    { label: t("playQuizPc"), icon: <Monitor className="w-5 h-5" />, start: { direction: "computer" } },
  ];

  return (
    <>
      <div className="play-cards">
        {/* Course quiz */}
        <div data-reveal className="play-card play-card--quiz">
          <div className="play-card__text">
            <h2 className="play-card__title">
              {t("playQuizTitle1")} <span className="play-card__accent">{t("playQuizTitle2")}</span>
            </h2>
            <p className="play-card__desc">{t("playQuizDesc")}</p>
          </div>
          <div className="play-card__goals">
            {goals.map((g) => (
              <button key={g.label} onClick={() => setOpen({ kind: "quiz", start: g.start })} className="play-goal group">
                <span className="play-goal__icon">{g.icon}</span>
                <span className="flex-1 text-start">{g.label}</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </button>
            ))}
          </div>
        </div>

        {/* Word game */}
        <div data-reveal className="play-card play-card--game">
          <div className="play-card__text">
            <h2 className="play-card__title">
              {t("playGameTitle1")} <span className="play-card__accent">{t("playGameTitle2")}</span>
            </h2>
            <p className="play-card__desc">{t("playGameDesc")}</p>
            <button onClick={() => setOpen({ kind: "game" })} className="play-card__start group">
              {t("playGameStart")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </button>
          </div>
          {/* decorative letter tiles */}
          <div className="play-tiles" aria-hidden="true">
            <span className="play-tile play-tile--w">W</span>
            <span className="play-tile play-tile--o">O</span>
            <span className="play-tile play-tile--r">R</span>
            <span className="play-tile play-tile--d">D</span>
            <span className="play-spark" />
          </div>
        </div>
      </div>

      {open?.kind === "quiz" && (
        <Dialog onClose={close} label={`${t("playQuizTitle1")} ${t("playQuizTitle2")}`}>
          <CourseQuiz courses={courses} start={open.start} />
        </Dialog>
      )}
      {open?.kind === "game" && (
        <Dialog onClose={close} label={`${t("playGameTitle1")} ${t("playGameTitle2")}`}>
          <VocabGame autoStart />
        </Dialog>
      )}
    </>
  );
}
