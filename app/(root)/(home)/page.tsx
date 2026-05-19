"use client";

import { Price } from "@/app/service/server";
import { useEffect, useState } from "react";
import CardItems from "../_components/cardItems";
import LoaderPage from "../_components/loader";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { Locale } from "@/lib/dictionaries";
import Link from "next/link";
import CourseQuiz from "../_components/courseQuiz";
import VocabGame from "../_components/vocabGame";
import FAQ from "../_components/faq";

function Homepage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const { t, locale, setLocale } = useTranslation();

  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => setPrices(data))
      .catch((err) => console.error("Xatolik:", err));
  }, []);

  const changeLang = (lang: Locale) => setLocale(lang);

  const scrollToCourses = () => {
    document.getElementById("courses-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      {/* Yellow Glowing Background Elements */}
      <div className="yellow-glow-bg">
        <div className="yellow-blob blob-1"></div>
        <div className="yellow-blob blob-2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center pt-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm bw-text font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 yellow-accent" />
            <span>{t("heroTag")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight bw-text mb-6 max-w-5xl animate-in fade-in zoom-in-95 duration-700 delay-150 uppercase w-full px-2 sm:px-0 leading-[1.1] md:leading-[1.05]">
            {t("heroTitle1")} <br />
            <span className="yellow-accent">{t("heroTitle2")}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300 font-medium">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
            <button 
              onClick={scrollToCourses}
              className="px-8 py-4 bw-button-solid font-bold text-lg flex items-center justify-center gap-2 group"
            >
              {t("btnCourses")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link 
              href="/contact" 
              className="px-8 py-4 bw-button-outline font-bold text-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5 yellow-accent" />
              {t("btnTrial")}
            </Link>
          </div>
        </div>

        {/* COURSES SECTION */}
        <div className="py-24" id="courses-section">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bw-text mb-4 uppercase tracking-tighter">
              {t("coursesTitle1")} <span className="yellow-accent">{t("coursesTitle2")}</span>
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-lg font-medium">{t("coursesDesc")}</p>
          </div>

          <div className="flex flex-col space-y-24">
            {prices.length <= 0 ? <LoaderPage /> : <CardItems prices={prices} />}
          </div>
        </div>

        {/* INTERACTIVE COURSE recommendation QUIZ */}
        <div className="py-24 border-t-2 border-zinc-100 dark:border-zinc-800">
          <div className="p-8 md:p-12 border-2 border-zinc-900 dark:border-zinc-700 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,184,0,0.25)] max-w-3xl mx-auto">
            <CourseQuiz />
          </div>
        </div>

        {/* VOCABULARY GAME */}
        <div className="py-24 border-t-2 border-zinc-100 dark:border-zinc-800">
          <div className="p-8 md:p-12 border-2 border-zinc-900 dark:border-zinc-700 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,184,0,0.25)] max-w-3xl mx-auto">
            <VocabGame />
          </div>
        </div>

        {/* FAQ ACCORDION */}
        <div className="border-t-2 border-zinc-100 dark:border-zinc-800">
          <FAQ />
        </div>

      </div>
    </div>
  );
}

export default Homepage;
