"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Phone, Star, Trophy } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { courseCardTitles, courseLabel, formatHours } from "@/lib/courses";
import { isTemplateCourseImage } from "@/lib/images";
import { formatPrice } from "@/lib/numbers";
import { cn } from "@/lib/utils";
import { NewsItem, Price, Review } from "@/types";
import CourseCover from "../../../_components/courseCover";
import { DropInGrid, Stars, WriteReview } from "../../../_components/reviews";
import ResultCard from "../../../news/_components/resultCard";

const PHONE = { href: "tel:+998732440099", label: "+998 73 244 00 99" };
const SHOWN_RESULTS = 6;

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const { t } = useTranslation();
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 mb-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl">
      <div className="text-center shrink-0">
        <p className="text-5xl font-black bw-text leading-none">{average.toFixed(1)}</p>
        <div className="flex justify-center my-2">
          <Stars value={Math.round(average)} size="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-zinc-500">{t("courseRatingCount", { n: reviews.length })}</p>
      </div>
      {/* How many gave 5, 4, … 1 stars */}
      <div className="w-full space-y-1.5">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = reviews.filter((r) => r.rating === n).length;
          return (
            <div key={n} className="flex items-center gap-2 text-xs font-bold text-zinc-500">
              <span className="w-3 text-right">{n}</span>
              <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
              <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-[#FFB800] rounded-full" style={{ width: `${(count / reviews.length) * 100}%` }} />
              </div>
              <span className="w-6">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CourseDetail({
  course,
  slug,
  results,
  reviews,
}: {
  course: Price;
  slug: string;
  results: NewsItem[];
  reviews: Review[];
}) {
  const { t, locale } = useTranslation();
  const titles = courseCardTitles(course, t);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const enrollHref = `/contact?course=${encodeURIComponent(courseLabel(course))}`;

  return (
    <div className="mt-28 md:mt-32 max-w-6xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Link href="/#courses-section" className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t("courseBack")}
      </Link>

      {/* HERO: picture + title, price, lesson length, enrol */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-zinc-900 dark:border-zinc-800 bg-[#FFB800]">
          {course.image && !isTemplateCourseImage(course.image) ? (
            <Image fill priority sizes="(min-width: 1024px) 560px, 100vw" src={course.image} alt={`${courseLabel(course)} kursi`} className="object-cover" />
          ) : (
            <CourseCover course={course} />
          )}
        </div>

        <div className="flex flex-col">
          {titles.label && <p className="text-xs uppercase tracking-widest font-extrabold text-zinc-500 mb-2">{titles.label}</p>}
          <h1 className="text-[clamp(2rem,8vw,3.25rem)] font-black bw-text uppercase tracking-tighter leading-none mb-4">{titles.heading}</h1>

          {reviews.length > 0 && (
            <a href="#rating" className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
              <Stars value={Math.round(average)} />
              <span className="bw-text">{average.toFixed(1)}</span>
              <span>· {t("courseRatingCount", { n: reviews.length })}</span>
            </a>
          )}

          <div className="p-5 mb-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black bw-text">
                  {formatPrice(course.courseChegirma, locale)} <span className="text-sm font-bold text-zinc-500">{t("courseCurrency")}</span>
                </p>
                {course.coursePrice > course.courseChegirma && (
                  <p className="text-sm font-bold line-through text-zinc-400">
                    {formatPrice(course.coursePrice, locale)} {t("courseCurrency")}
                  </p>
                )}
              </div>
              {course.courseTime && (
                <div className="flex items-center gap-1.5 text-sm bg-[#FFB800] text-black font-extrabold px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4" />
                  {t("courseLesson")}: {formatHours(course.courseTime, locale)} {t("courseTime")}
                </div>
              )}
            </div>
            {course.chegirma && <p className="mt-3 text-sm font-semibold text-yellow-700 dark:text-yellow-400">{t(course.chegirma)}</p>}
          </div>

          <Link href={enrollHref} className="w-full py-4 px-6 bw-button-solid font-black flex items-center justify-center gap-2 text-base mb-3">
            {t("btnEnroll")}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <a href={PHONE.href} className="inline-flex items-center justify-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
            <Phone className="w-4 h-4" />
            <span>{t("courseQuestions")}: <span dir="ltr" className="whitespace-nowrap">{PHONE.label}</span></span>
          </a>
        </div>
      </div>

      {/* ABOUT + WHAT YOU LEARN (filled in the admin panel) */}
      {!!(course.description || course.highlights?.length) && (
        <section className={cn("grid gap-6 mb-16", course.description && course.highlights?.length && "lg:grid-cols-2")}>
          {course.description && (
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-3xl">
              <h2 className="text-2xl font-black bw-text uppercase tracking-tight mb-4">{t("courseAbout")}</h2>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>
          )}
          {!!course.highlights?.length && (
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-3xl">
              <h2 className="text-2xl font-black bw-text uppercase tracking-tight mb-4">{t("courseLearn")}</h2>
              <ul className="space-y-3">
                {course.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 font-medium text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* RESULTS of this course's students */}
      {results.length > 0 && (
        <section className="mb-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-black bw-text uppercase tracking-tighter flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#FFB800] shrink-0" />
              {t("courseResults")}
            </h2>
            <Link href="/news" className="inline-flex items-center gap-2 text-sm font-black text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
              {t("courseAllResults")} ({results.length})
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {results.slice(0, SHOWN_RESULTS).map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* RATING of the course: summary, ratings, rate it */}
      <section id="rating" className="scroll-mt-24">
        <h2 className="text-3xl md:text-4xl font-black bw-text uppercase tracking-tighter mb-8 flex items-center gap-3">
          <Star className="w-8 h-8 fill-[#FFB800] text-[#FFB800] shrink-0" />
          {t("courseRatingTitle")}
        </h2>
        {reviews.length > 0 ? (
          <>
            <RatingSummary reviews={reviews} />
            <DropInGrid reviews={reviews} />
          </>
        ) : (
          <p className="mb-8 font-medium text-zinc-500">{t("courseNoRatings")}</p>
        )}
        <div className="max-w-2xl mx-auto">
          <WriteReview courseSlug={slug} />
        </div>
      </section>
    </div>
  );
}
