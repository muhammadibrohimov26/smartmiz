"use client";

import { useState } from "react";
import { CourseRating, Price } from "@/types"
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Star } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { courseCardTitles, courseLabel, courseSlug, formatHours, withKursi } from "@/lib/courses";
import { formatPrice } from "@/lib/numbers";
import { isTemplateCourseImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import CourseCover from "./courseCover";

interface PricesItemProps{
    prices: Price[]
    // Average rating per course slug (courses without ratings are missing)
    ratings?: Record<string, CourseRating>
}

const CardItems: React.FC<PricesItemProps> = ({ prices, ratings = {} }) => {
    const { t, locale } = useTranslation();
    // Filter by language / subject ("Ingliz tili", "Koreys tili", "Kompyuter kursi"…)
    const [filter, setFilter] = useState("all");
    const groups = Array.from(
        prices.reduce((m, p) => m.set(p.courseName, (m.get(p.courseName) ?? 0) + 1), new Map<string, number>())
    );
    const shown = filter === "all" ? prices : prices.filter((p) => p.courseName === filter);

    return (
        <div className="mt-12 mb-16">
            {groups.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10" role="group">
                    {[["all", prices.length] as [string, number], ...groups].map(([g, n]) => (
                        <button
                            key={g}
                            onClick={() => setFilter(g)}
                            aria-pressed={filter === g}
                            className={cn(
                                "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl border-2 font-black text-sm transition-colors",
                                filter === g
                                    ? "bg-[#FFB800] border-[#FFB800] text-black"
                                    : "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-800 bw-text hover:border-[#FFB800]"
                            )}
                        >
                            {g === "all" ? t("courseFilterAll") : t(g)}
                            {n > 1 && <span className={cn("text-xs font-bold", filter === g ? "text-black/60" : "text-zinc-500")}>{n}</span>}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
                {shown.map((price, index) => {
                    const titles = courseCardTitles(price, t);
                    const href = `/courses/${courseSlug(price)}`;
                    const rating = ratings[courseSlug(price)];
                    return (
                    <div
                        key={price.id ?? index}
                        className="group relative w-full bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900/80 rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/5 hover:-translate-y-2 flex flex-col"
                    >
                        {/* Course Image & Hero Area */}
                        <div className="relative aspect-square w-full overflow-hidden border-b border-gray-100 dark:border-zinc-900/50 bg-[#FFB800]">
                            {price.image && !isTemplateCourseImage(price.image) ? <Image
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                src={price.image}
                                alt={withKursi(courseLabel(price))}
                            /> : <CourseCover course={price} />}
                        </div>

                        {/* Card Body */}
                        <div className="p-5 sm:p-8 flex flex-col flex-grow">
                            {/* Category & Title — the title links to the course page and,
                                stretched over the card, makes the whole card clickable */}
                            <span className="block min-h-[1rem] mb-3 text-xs uppercase tracking-widest font-extrabold text-gray-400 dark:text-zinc-500">
                                {titles.label}
                            </span>

                            {/* Name, and the course rating on its right (goes to the rating
                                part of the course page) */}
                            <div className="flex items-start justify-between gap-3 mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase group-hover:text-yellow-500 transition-colors duration-300">
                                    <Link href={href} className="after:absolute after:inset-0 after:content-['']">
                                        {titles.heading}
                                    </Link>
                                </h2>
                                <Link
                                    href={`${href}#rating`}
                                    aria-label={rating ? `${rating.average.toFixed(1)} / 5` : t("courseRateShort")}
                                    className="relative z-10 shrink-0 mt-1 flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-black text-gray-900 dark:text-white hover:border-[#FFB800] transition-colors"
                                >
                                    <Star className={cn("w-3.5 h-3.5", rating ? "fill-[#FFB800] text-[#FFB800]" : "text-gray-400 dark:text-zinc-500")} />
                                    {rating ? (
                                        <>
                                            {rating.average.toFixed(1)}
                                            <span className="font-bold text-gray-400 dark:text-zinc-500">({rating.count})</span>
                                        </>
                                    ) : (
                                        <span className="font-bold text-gray-500 dark:text-zinc-400">{t("courseRateShort")}</span>
                                    )}
                                </Link>
                            </div>

                            {/* Pricing Section */}
                            <div className="flex justify-between items-center mb-6 rounded-2xl bg-gray-50 dark:bg-zinc-900/30 p-4 border border-gray-100 dark:border-zinc-900/50">
                                <div>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {formatPrice(price.courseChegirma, locale)} <span className="text-xs font-medium text-gray-400">{t("courseCurrency")}</span>
                                    </p>
                                    {price.coursePrice > price.courseChegirma && (
                                        <p className="text-xs font-bold line-through text-gray-400 dark:text-zinc-500 mt-0.5">
                                            {formatPrice(price.coursePrice, locale)} {t("courseCurrency")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs bg-yellow-500 text-black font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-yellow-500/10">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{formatHours(price.courseTime, locale)} {t("courseTime")}</span>
                                </div>
                            </div>

                            {/* Promotion Banner */}
                            {price.chegirma && (
                                <div className="mb-6 text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-500/5 p-3.5 rounded-2xl border border-yellow-500/10 leading-relaxed">
                                    {t(price.chegirma)}
                                </div>
                            )}

                            {/* Enroll Button (above the stretched link, so it keeps its own target) */}
                            <div className="mt-auto relative z-10 flex flex-col gap-3">
                                <Link
                                    className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-yellow-500 dark:hover:bg-yellow-500 hover:text-black dark:hover:text-black font-bold flex items-center justify-center gap-2 rounded-2xl transition-all duration-300 tracking-wide text-sm shadow-lg shadow-black/5 dark:shadow-white/5 active:scale-[0.98]"
                                    href={`/contact?course=${encodeURIComponent(courseLabel(price))}`}
                                >
                                    {t("btnEnroll")}
                                </Link>
                                <Link href={href} className="flex items-center justify-center gap-1.5 text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
                                    {t("courseDetails")}
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};
export default CardItems;
