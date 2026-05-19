"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { Gamepad2, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface Question {
  word: string;
  correct: string;
  options: string[];
}

const wordBank = [
  { word: "Apple",        uz: "Olma",       ru: "Яблоко",     tr: "Elma",        ko: "사과" },
  { word: "Book",         uz: "Kitob",       ru: "Книга",      tr: "Kitap",       ko: "책" },
  { word: "Water",        uz: "Suv",         ru: "Вода",       tr: "Su",          ko: "물" },
  { word: "School",       uz: "Maktab",      ru: "Школа",      tr: "Okul",        ko: "학교" },
  { word: "Teacher",      uz: "O'qituvchi",  ru: "Учитель",    tr: "Öğretmen",    ko: "선생님" },
  { word: "Family",       uz: "Oila",        ru: "Семья",      tr: "Aile",        ko: "가족" },
  { word: "Friend",       uz: "Do'st",       ru: "Друг",       tr: "Arkadaş",     ko: "친구" },
  { word: "House",        uz: "Uy",          ru: "Дом",        tr: "Ev",          ko: "집" },
  { word: "Money",        uz: "Pul",         ru: "Деньги",     tr: "Para",        ko: "돈" },
  { word: "Time",         uz: "Vaqt",        ru: "Время",      tr: "Zaman",       ko: "시간" },
  { word: "City",         uz: "Shahar",      ru: "Город",      tr: "Şehir",       ko: "도시" },
  { word: "Language",     uz: "Til",         ru: "Язык",       tr: "Dil",         ko: "언어" },
  { word: "Work",         uz: "Ish",         ru: "Работа",     tr: "İş",          ko: "일" },
  { word: "Dream",        uz: "Orzu",        ru: "Мечта",      tr: "Rüya",        ko: "꿈" },
  { word: "Travel",       uz: "Sayohat",     ru: "Путешествие",tr: "Seyahat",     ko: "여행" },
  { word: "Beautiful",    uz: "Chiroyli",    ru: "Красивый",   tr: "Güzel",       ko: "아름다운" },
  { word: "Important",    uz: "Muhim",       ru: "Важный",     tr: "Önemli",      ko: "중요한" },
  { word: "Knowledge",    uz: "Bilim",       ru: "Знание",     tr: "Bilgi",       ko: "지식" },
  { word: "Future",       uz: "Kelajak",     ru: "Будущее",    tr: "Gelecek",     ko: "미래" },
  { word: "Success",      uz: "Muvaffaqiyat",ru: "Успех",      tr: "Başarı",      ko: "성공" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getLevelLabel(score: number): { key: string; color: string } {
  if (score >= 9) return { key: "levelC1", color: "text-emerald-500" };
  if (score >= 7) return { key: "levelB2", color: "text-blue-500" };
  if (score >= 5) return { key: "levelB1", color: "text-yellow-500" };
  if (score >= 3) return { key: "levelA2", color: "text-orange-500" };
  return { key: "levelA1", color: "text-red-500" };
}

export default function VocabGame() {
  const { t, locale } = useTranslation();
  const [gameState, setGameState] = useState<"idle" | "playing" | "feedback" | "done">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const getTranslation = useCallback((item: typeof wordBank[0]) => {
    switch (locale) {
      case "ru": return item.ru;
      case "tr": return item.tr;
      case "ko": return item.ko;
      default:   return item.uz;
    }
  }, [locale]);

  const buildQuestions = useCallback((): Question[] => {
    const pool = shuffle(wordBank).slice(0, 10);
    return pool.map(item => {
      const correct = getTranslation(item);
      const distractors = shuffle(
        wordBank
          .filter(w => w !== item)
          .map(w => getTranslation(w))
      ).slice(0, 3);
      return {
        word: item.word,
        correct,
        options: shuffle([correct, ...distractors]),
      };
    });
  }, [getTranslation]);

  const startGame = () => {
    setQuestions(buildQuestions());
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setGameState("playing");
  };

  const handleAnswer = (opt: string) => {
    if (gameState !== "playing") return;
    const correct = opt === questions[current].correct;
    setSelected(opt);
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setGameState("feedback");

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setGameState("done");
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setIsCorrect(null);
        setGameState("playing");
      }
    }, 900);
  };

  const level = getLevelLabel(score);
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* IDLE SCREEN */}
      {gameState === "idle" && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-[#FFB800]/10 border-4 border-[#FFB800] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-10 h-10 text-[#FFB800]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black bw-text uppercase tracking-tight mb-3">
            {t("gameTitle")}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4 max-w-md mx-auto">
            {t("gameDesc")}
          </p>
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFB800]" /> 10 {t("gameWords")}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("game4Options")}
            </div>
          </div>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-4 bw-button-solid font-black text-lg uppercase tracking-wider group"
          >
            {t("gameStart")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* PLAYING / FEEDBACK */}
      {(gameState === "playing" || gameState === "feedback") && questions.length > 0 && (
        <div className="animate-in fade-in duration-300">
          {/* Progress */}
          <div className="flex justify-between items-center text-xs font-black text-zinc-400 mb-3 uppercase tracking-wider">
            <span>{current + 1} / {questions.length}</span>
            <span className="text-[#FFB800]">⭐ {score}</span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-[#FFB800] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Word Card */}
          <div className="text-center mb-8">
            <div className="inline-block px-8 py-6 border-4 border-zinc-900 dark:border-zinc-700 rounded-3xl bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                {t("gameTranslate")}
              </p>
              <p className="text-4xl md:text-5xl font-black bw-text">
                {questions[current].word}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {questions[current].options.map(opt => {
              let className = "p-4 border-2 rounded-2xl font-bold text-sm md:text-base bw-text text-center transition-all duration-200 ";
              if (gameState === "feedback") {
                if (opt === questions[current].correct) {
                  className += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]";
                } else if (opt === selected) {
                  className += "border-red-500 bg-red-50 dark:bg-red-900/30";
                } else {
                  className += "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-40";
                }
              } else {
                className += "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#FFB800] hover:shadow-[3px_3px_0px_0px_rgba(255,184,0,1)] cursor-pointer";
              }
              return (
                <button key={opt} onClick={() => handleAnswer(opt)} className={className}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback Message */}
          {gameState === "feedback" && (
            <div className={`mt-6 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider animate-in fade-in zoom-in-95 duration-200 ${isCorrect ? "text-emerald-500" : "text-red-500"}`}>
              {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {isCorrect ? t("gameCorrect") : t("gameWrong")}
            </div>
          )}
        </div>
      )}

      {/* DONE / RESULT SCREEN */}
      {gameState === "done" && (
        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 border-4 border-[#FFB800] rounded-3xl bg-[#FFB800]/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-[#FFB800]" />
          </div>

          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">{t("gameYourLevel")}</p>
          <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 ${level.color}`}>
            {t(level.key)}
          </h3>
          <p className="text-2xl font-black bw-text mb-1">
            {score} / {questions.length}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 max-w-sm mx-auto">
            {t("gameScoreMsg")}
          </p>

          <div className="inline-block bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-8 max-w-sm">
            <p className="text-sm font-black bw-text mb-1">
              {t("gameUpgradeTitle")}
            </p>
            <p className="text-xs text-zinc-500 font-medium">
              {t("gameUpgradeDesc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bw-button-solid font-black text-sm uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 yellow-accent" />
              {t("gameEnroll")}
            </Link>
            <button
              onClick={startGame}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bw-button-outline font-black text-sm uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              {t("gameRetry")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
