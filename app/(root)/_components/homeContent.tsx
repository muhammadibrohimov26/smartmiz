"use client";

import { CourseRating, Price, Review, SiteSettings } from "@/types";
import CardItems from "./cardItems";
import { ArrowRight, BookOpen, Laptop } from "lucide-react";
import Image from "next/image";
import Flag from "@/components/shared/flag";
import { courseSlug } from "@/lib/courses";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";
import PlayCards from "./playCards";
import FAQ from "./faq";
import Reviews from "./reviews";
import AboutContent from "./aboutContent";

function HomeContent({ prices, reviews, settings, ratings }: { prices: Price[]; reviews: Review[]; settings: SiteSettings; ratings: Record<string, CourseRating> }) {
  const { t } = useTranslation();

  // The hero's short line: the first sentence of the description
  const heroLead = t("heroDesc").match(/^.*?[.!?。](?=\s|$)/)?.[0] ?? t("heroDesc");

  // Quick links under the hero buttons: a course page when there is one
  const chips: { key: string; label?: string; icon: React.ReactNode }[] = [
    { key: "Ingliz tili", icon: <Flag code="gb" className="w-6 h-4 rounded-[3px] shadow-sm" /> },
    { key: "Koreys tili", icon: <Flag code="kr" className="w-6 h-4 rounded-[3px] shadow-sm ring-1 ring-black/5" /> },
    { key: "Rus tili", icon: <Flag code="ru" className="w-6 h-4 rounded-[3px] shadow-sm ring-1 ring-black/5" /> },
    { key: "Kompyuter kursi", label: "heroChipComputer", icon: <Laptop className="w-5 h-5 text-[#3fae2a]" /> },
  ];
  const chipHref = (name: string) => {
    const course = prices.find((p) => p.courseName === name);
    return course ? `/courses/${courseSlug(course)}` : "#courses-section";
  };

  const scrollToCourses = () => {
    document.getElementById("courses-section")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* HERO: text on the left, the photo with a curved edge on the right */}
      <div className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__text">
            <h1 className="home-hero__title">
              <span className="block">{t("heroTitle1")}</span>
              <span className="home-hero__accent">
                {t("heroTitle2")}.
                <svg className="home-hero__swoosh" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 14 C 50 4, 120 1, 197 9" />
                </svg>
              </span>
            </h1>

            <p className="home-hero__lead">{heroLead}</p>

            <div className="home-hero__actions">
              <button onClick={scrollToCourses} className="home-btn home-btn--solid group">
                {t("btnCourses")}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
              <Link href="/contact" className="home-btn home-btn--outline">
                <BookOpen className="w-5 h-5 text-[#e0a106]" />
                {t("btnTrial")}
              </Link>
            </div>

            <div className="home-hero__chips">
              {chips.map((c) => (
                <Link key={c.key} href={chipHref(c.key)} className="home-chip">
                  {c.icon}
                  <span>{t(c.label ?? c.key)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="home-hero__photo">
            <div className="home-hero__photo-frame">
              <Image
                src="/img/hero-students.webp"
                alt={t("heroTitle1") + " " + t("heroTitle2")}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[60%_center]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* the rest lines up with the hero text and the navbar (the site container) */}
      <div className="relative z-10">
        
        {/* COURSES SECTION */}
        <section className="pt-16 md:pt-20 pb-10 scroll-mt-28" id="courses-section">
          <div className="sec-head">
            <h2 className="sec-head__title">{t("coursesHeading")}</h2>
            <p className="sec-head__lead">{t("coursesLead")}</p>
          </div>

          <div className="flex flex-col space-y-24">
            <CardItems prices={prices} ratings={ratings} />
          </div>
        </section>

        {/* COURSE QUIZ + WORD GAME (compact cards that open a dialog) */}
        <PlayCards courses={prices} />

        {/* CUSTOMER REVIEWS */}
        <Reviews reviews={reviews} />

        {/* FAQ ACCORDION */}
        <FAQ />

        {/* ABOUT (photo, text, branches) */}
        <div>
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
