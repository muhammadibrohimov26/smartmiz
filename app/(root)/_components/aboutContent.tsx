"use client";

import { useTranslation } from "@/context/LanguageContext";
import { Award, Users, BookOpen, Play, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

function AboutContent() {
  const { t, locale } = useTranslation();
  const [courseCount, setCourseCount] = useState<number>(0);

  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourseCount(data.length);
        }
      })
      .catch((err) => console.error("Error fetching courses count:", err));
  }, []);

  const activeCourses = [
    "Ingliz tili",
    "Rus tili",
    "Koreys tili",
    "Turk tili",
    "Arab tili",
    "Kompyuter kursi",
    "Roboto texnika",
    "Mental arifmetika",
    "IELTS",
    "CEFR",
    "C1",
    "Topic 1,2",
    "EPS"
  ];

  return (
    <div className="mt-28 md:mt-32 max-w-6xl mx-auto px-4 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-black bw-text tracking-tighter uppercase mb-4">
          {t("aboutTitle")}
        </h1>
        <div className="w-24 h-1.5 bg-[#FFB800] mx-auto rounded-full mb-6"></div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Stat 1: Experience */}
        <div className="bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-2xl p-6 text-center hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB800]/30">
            <Award className="w-6 h-6 text-[#FFB800]" />
          </div>
          <h3 className="text-3xl font-black bw-text mb-1 tracking-tight">{t("aboutStats1")}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">{t("aboutStats1Label")}</p>
        </div>

        {/* Stat 2: Students */}
        <div className="bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-2xl p-6 text-center hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB800]/30">
            <Users className="w-6 h-6 text-[#FFB800]" />
          </div>
          <h3 className="text-3xl font-black bw-text mb-1 tracking-tight">{t("aboutStats2")}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">{t("aboutStats2Label")}</p>
        </div>

        {/* Stat 3: Courses */}
        <div className="bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-2xl p-6 text-center hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB800]/30">
            <BookOpen className="w-6 h-6 text-[#FFB800]" />
          </div>
          <h3 className="text-3xl font-black bw-text mb-1 tracking-tight">
            {courseCount || 14}{locale === "uz" ? " ta" : locale === "ko" ? "개" : ""}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">{t("aboutStats3Label")}</p>
        </div>

      </div>

      {/* CORE DETAILS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
        
        {/* History Paragraph */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
          <div>
            <h2 className="text-2xl md:text-3xl font-black bw-text uppercase tracking-tight mb-4">
              SMARTMIZ 2016 - 2026
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-base md:text-lg leading-relaxed font-semibold">
              {t("aboutHistory")}
            </p>
          </div>
          <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 my-6"></div>
          <div className="flex items-center gap-2 text-[#FFB800] font-black text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Smartmiz o'quv markazi professional jamoasi</span>
          </div>
        </div>

        {/* Video Embed Play Teaser Card */}
        <a 
          target="_blank" 
          href="https://www.instagram.com/tv/CazdM-nFCUF/?igsh=eWdscjR0OXMwcHEx"
          className="lg:col-span-5 relative group border-4 border-zinc-950 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] bg-zinc-950 flex flex-col items-center justify-center p-8 text-center min-h-[300px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(255,184,0,1)]"
        >
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://idyllic-sprite-7cad0a.netlify.app/img/bg.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-0"></div>

          {/* Card Content */}
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110 group-hover:bg-[#FFB800]/20 group-hover:border-[#FFB800]/50 shadow-lg">
              <Play className="w-9 h-9 text-[#FFB800] fill-[#FFB800] animate-pulse" />
            </div>
            <div>
              <h4 className="text-white text-lg font-black uppercase tracking-wider mb-2">
                {t("aboutVideoBtn")}
              </h4>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Instagram video • 9 Yillik Tarix
              </p>
            </div>
          </div>
        </a>

      </div>

      {/* ACTIVE COURSES LIST */}
      <div className="bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
        <h2 className="text-2xl md:text-3xl font-black bw-text uppercase tracking-tight mb-6 text-center md:text-left">
          {t("aboutCoursesTitle")}
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {activeCourses.map((course) => (
            <div 
              key={course}
              className="px-4 py-2 border-2 border-zinc-900 dark:border-zinc-800 rounded-full bg-zinc-50 dark:bg-zinc-950 font-extrabold text-sm bw-text hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-[1px_1px_0px_0px_rgba(255,184,0,1)] flex items-center gap-1.5"
            >
              <div className="w-2 h-2 rounded-full bg-[#FFB800]"></div>
              <span>{t(course)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AboutContent;
