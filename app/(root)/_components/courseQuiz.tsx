"use client";

import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowRight, RotateCcw, CheckCircle2, Sparkles, Trophy, BookOpen, Phone } from "lucide-react";
import Link from "next/link";

type Answer = string | null;

interface QuizResult {
  course: string;
  description: string;
  icon: string;
  color: string;
}

// Logic: [direction][age][goal] => course key
const resultMap: Record<string, Record<string, Record<string, string>>> = {
  language: {
    child:  { abroad: "IELTS", certificate: "IELTS", career: "Ingliz tili" },
    teen:   { abroad: "IELTS", certificate: "IELTS", career: "Koreys tili" },
    adult:  { abroad: "IELTS", certificate: "CEFR C1", career: "Koreys tili" },
  },
  computer: {
    child:  { abroad: "Roboto texnika", certificate: "Kompyuter kursi", career: "Kompyuter kursi" },
    teen:   { abroad: "Kompyuter kursi", certificate: "Kompyuter kursi", career: "Kompyuter kursi" },
    adult:  { abroad: "Kompyuter kursi", certificate: "Kompyuter kursi", career: "Kompyuter kursi" },
  },
  children: {
    child:  { abroad: "Mental arifmetika", certificate: "Mental arifmetika", career: "Roboto texnika" },
    teen:   { abroad: "Roboto texnika",    certificate: "Roboto texnika",    career: "Roboto texnika" },
    adult:  { abroad: "Ingliz tili",       certificate: "IELTS",             career: "Koreys tili" },
  },
};

export default function CourseQuiz() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0=intro, 1,2,3=questions, 4=result
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [selected, setSelected] = useState<Answer>(null);

  const questions = [
    {
      key: "quizQ1",
      options: [
        { label: t("quizQ1A"), value: "language", icon: "🌍" },
        { label: t("quizQ1B"), value: "computer", icon: "💻" },
        { label: t("quizQ1C"), value: "children", icon: "👧" },
      ],
    },
    {
      key: "quizQ2",
      options: [
        { label: t("quizQ2A"), value: "child", icon: "🧒" },
        { label: t("quizQ2B"), value: "teen",  icon: "🧑" },
        { label: t("quizQ2C"), value: "adult", icon: "👨" },
      ],
    },
    {
      key: "quizQ3",
      options: [
        { label: t("quizQ3A"), value: "abroad",      icon: "✈️" },
        { label: t("quizQ3B"), value: "certificate", icon: "🏅" },
        { label: t("quizQ3C"), value: "career",      icon: "💼" },
      ],
    },
  ];

  const getResult = (): QuizResult => {
    const dir = answers[1] as string;
    const age = answers[2] as string;
    const goal = answers[3] as string;
    const courseKey = resultMap[dir]?.[age]?.[goal] ?? "Ingliz tili";

    const resultData: Record<string, QuizResult> = {
      "IELTS":             { course: "IELTS Pro",          description: t("quizResultIELTS"),    icon: "🇬🇧", color: "from-blue-500 to-blue-700" },
      "CEFR C1":           { course: "CEFR C1",            description: t("quizResultCEFR"),     icon: "🌍", color: "from-purple-500 to-purple-700" },
      "Koreys tili":       { course: t("Koreys tili"),     description: t("quizResultKorean"),   icon: "🇰🇷", color: "from-red-500 to-red-700" },
      "Ingliz tili":       { course: t("Ingliz tili"),     description: t("quizResultEnglish"),  icon: "🇬🇧", color: "from-indigo-500 to-indigo-700" },
      "Kompyuter kursi":   { course: t("Kompyuter kursi"), description: t("quizResultPC"),       icon: "💻", color: "from-emerald-500 to-emerald-700" },
      "Roboto texnika":    { course: t("Roboto texnika"),  description: t("quizResultRobot"),    icon: "🤖", color: "from-orange-500 to-orange-700" },
      "Mental arifmetika": { course: t("Mental arifmetika"), description: t("quizResultMath"),  icon: "🧠", color: "from-pink-500 to-pink-700" },
    };

    return resultData[courseKey] ?? resultData["Ingliz tili"];
  };

  const handleNext = () => {
    if (!selected) return;
    setAnswers(prev => ({ ...prev, [step]: selected }));
    setSelected(null);
    setStep(prev => prev + 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setSelected(null);
  };

  const result = step === 4 ? getResult() : null;
  const progress = step === 0 ? 0 : (step / 3) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* INTRO SCREEN */}
      {step === 0 && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-[#FFB800]/10 border-4 border-[#FFB800] rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">
            🎯
          </div>
          <h3 className="text-2xl md:text-3xl font-black bw-text uppercase tracking-tight mb-3">
            {t("quizTitle")}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 max-w-md mx-auto">
            {t("quizDesc")}
          </p>
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-8 py-4 bw-button-solid font-black text-lg uppercase tracking-wider group"
          >
            {t("quizStart")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* QUESTION SCREENS */}
      {step >= 1 && step <= 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-400">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-black text-zinc-400 mb-2 uppercase tracking-wider">
              <span>{t("quizStep")} {step} / 3</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFB800] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h3 className="text-xl md:text-2xl font-black bw-text mb-6">
            {t(questions[step - 1].key)}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {questions[step - 1].options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left font-bold ${
                  selected === opt.value
                    ? "border-[#FFB800] bg-[#FFB800]/10 shadow-[3px_3px_0px_0px_rgba(255,184,0,1)]"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="bw-text text-sm md:text-base">{opt.label}</span>
                {selected === opt.value && (
                  <CheckCircle2 className="w-5 h-5 text-[#FFB800] ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full py-4 bw-button-solid font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {step === 3 ? t("quizFinish") : t("quizNext")}
            <ArrowRight className="w-5 h-5 group-enabled:group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* RESULT SCREEN */}
      {step === 4 && result && (
        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${result.color} flex items-center justify-center mx-auto text-5xl shadow-lg`}>
              {result.icon}
            </div>
            <div className="absolute -top-2 -right-2 md:right-1/3">
              <Trophy className="w-8 h-8 text-[#FFB800] drop-shadow" />
            </div>
          </div>

          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-full text-xs font-black text-[#FFB800] uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              {t("quizYourCourse")}
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-black bw-text uppercase tracking-tight mt-3 mb-3">
            {result.course}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 max-w-sm mx-auto">
            {result.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/contact?course=${encodeURIComponent(result.course)}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bw-button-solid font-black text-sm uppercase tracking-wider"
            >
              <Phone className="w-4 h-4" />
              {t("quizEnroll")}
            </Link>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bw-button-outline font-black text-sm uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              {t("quizRetry")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
