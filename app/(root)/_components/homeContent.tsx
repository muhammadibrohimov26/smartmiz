"use client";

import Typewriter from "@/components/shared/typewriter";
import { CourseRating, Price, Review, SiteSettings } from "@/types";
import CardItems from "./cardItems";
import { Sparkles, ArrowRight, BookOpen, ArrowDown, Globe2, Code2, GraduationCap } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";
import CourseQuiz from "./courseQuiz";
import VocabGame from "./vocabGame";
import FAQ from "./faq";
import Reviews from "./reviews";
import AboutContent from "./aboutContent";

function HomeContent({ prices, reviews, settings, ratings }: { prices: Price[]; reviews: Review[]; settings: SiteSettings; ratings: Record<string, CourseRating> }) {
  const { t } = useTranslation();

  // Hero types itself out: title line 1 → line 2 → description
  const TITLE_SPEED = 60;
  const DESC_SPEED = 14;
  const title1 = t("heroTitle1");
  const title2 = t("heroTitle2");
  const title2Delay = 300 + title1.length * TITLE_SPEED + 150;
  const descDelay = title2Delay + title2.length * TITLE_SPEED + 250;

  const scrollToCourses = () => {
    document.getElementById("courses-section")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      {/* Yellow Glowing Background Elements */}
      <div className="yellow-glow-bg">
        <div className="yellow-blob blob-1"></div>
        <div className="yellow-blob blob-2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="neo-hero relative min-h-[90vh] flex flex-col items-center justify-center text-center pt-32 pb-20">
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" />
            <div className="orbit-satellite satellite-one"><Globe2 /><span>EN / KO / AR</span></div>
            <div className="orbit-satellite satellite-two"><Code2 /><span>&lt; / &gt;</span></div>
            <div className="orbit-satellite satellite-three"><GraduationCap /></div>
            <span className="orbit-spark spark-one" /><span className="orbit-spark spark-two" />
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm bw-text font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 yellow-accent" />
            <span>{t("heroTag")}</span>
          </div>

          <h1 className="hero-title font-black tracking-tight bw-text mb-8 max-w-5xl w-full px-2 leading-[1.04]">
            <Typewriter text={title1} delay={300} speed={TITLE_SPEED} /> <br />
            <Typewriter text={title2} delay={title2Delay} speed={TITLE_SPEED} className="hero-gradient" /><span className="hero-period">.</span>
          </h1>

          <p className="hero-description text-lg md:text-xl text-gray-500 max-w-xl mb-10 font-medium leading-relaxed">
            <Typewriter text={t("heroDesc")} delay={descDelay} speed={DESC_SPEED} keepCaret />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
            <button 
              onClick={scrollToCourses}
              className="px-8 py-4 bw-button-solid font-bold text-lg flex items-center justify-center gap-2 group"
            >
              {t("btnCourses")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
            <Link 
              href="/contact" 
              className="px-8 py-4 bw-button-outline font-bold text-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5 yellow-accent" />
              {t("btnTrial")}
            </Link>
          </div>
          <button className="hero-scroll" onClick={scrollToCourses} aria-label={t("btnCourses")}><ArrowDown className="w-4 h-4" /></button>
        </div>

        <div className="subject-ribbon" aria-hidden="true">
          <div>{[0, 1].map(copy => <span key={copy}>{["Ingliz tili", "Koreys tili", "Kompyuter kursi", "Arab tili", "Rus tili", "Turk tili"].map(subject => <span key={subject}><span className="ribbon-star">✳</span>{t(subject)}</span>)}</span>)}</div>
        </div>

        {/* COURSES SECTION */}
        <section className="py-24" id="courses-section">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bw-text mb-4 uppercase tracking-tighter">
              <Typewriter text={t("coursesTitle1")} /> <Typewriter text={t("coursesTitle2")} delay={t("coursesTitle1").length * 45} className="yellow-accent" />
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-lg font-medium">{t("coursesDesc")}</p>
          </div>

          <div className="flex flex-col space-y-24">
            <CardItems prices={prices} ratings={ratings} />
          </div>
        </section>

        {/* INTERACTIVE COURSE recommendation QUIZ */}
        <div data-reveal className="py-24 border-t-2 border-zinc-100 dark:border-zinc-800">
          <div className="p-5 sm:p-8 md:p-12 border-2 border-zinc-900 dark:border-zinc-700 rounded-3xl bg-zinc-50 dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,184,0,0.25)] max-w-3xl mx-auto">
            <CourseQuiz courses={prices} />
          </div>
        </div>

        {/* VOCABULARY GAME */}
        <div data-reveal className="py-24 border-t-2 border-zinc-100 dark:border-zinc-800">
          <div className="p-5 sm:p-8 md:p-12 border-2 border-zinc-900 dark:border-zinc-700 rounded-3xl bg-zinc-50 dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,184,0,0.25)] max-w-3xl mx-auto">
            <VocabGame />
          </div>
        </div>

        {/* CUSTOMER REVIEWS */}
        <div className="border-t-2 border-zinc-100 dark:border-zinc-800">
          <Reviews reviews={reviews} />
        </div>

        {/* FAQ ACCORDION */}
        <div className="border-t-2 border-zinc-100 dark:border-zinc-800">
          <FAQ />
        </div>

        {/* ABOUT (history, stats, video) */}
        <div className="border-t-2 border-zinc-100 dark:border-zinc-800">
          <AboutContent
            courses={prices}
            studentCount={settings.studentCount}
            videoUrl={settings.aboutVideoUrl}
            videoImage={settings.aboutVideoImage}
          />
        </div>

      </div>
    </div>
  );
}

export default HomeContent;
