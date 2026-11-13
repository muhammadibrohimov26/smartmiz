"use client";

import { useEffect, useRef, useState } from "react";
import { CourseRating, Price } from "@/types"
import Link from "next/link";
import { BookOpen, Bot, Brain, BriefcaseBusiness, ChevronDown, Clock, FileBadge, GraduationCap, Laptop, Layers, MessagesSquare, Monitor, MoonStar, MoreHorizontal, Star } from "lucide-react";
import Flag from "@/components/shared/flag";
import { useTranslation } from "@/context/LanguageContext";
import { courseCardTitles, courseLabel, courseSlug, formatHours } from "@/lib/courses";
import { CourseIcon, courseInfo, firstSentence, pickText } from "@/lib/courseInfo";
import { formatPrice } from "@/lib/numbers";
import { cn } from "@/lib/utils";

interface PricesItemProps{
    prices: Price[]
    // Average rating per course slug (courses without ratings are missing)
    ratings?: Record<string, CourseRating>
}

const PRIMARY = ["Ingliz tili", "Rus tili", "Koreys tili", "Arab tili", "Turk tili", "Kompyuter kursi"];
// Short chip labels where the subject name is long
const CHIP_LABELS: Record<string, string> = { "Kompyuter kursi": "heroChipComputer" };

const ICONS = {
    book: BookOpen,
    certificate: FileBadge,
    layers: Layers,
    chat: MessagesSquare,
    graduation: GraduationCap,
    briefcase: BriefcaseBusiness,
    monitor: Monitor,
    robot: Bot,
    brain: Brain,
};

// The yellow badge at the top of a course card: an icon or a few letters
function CourseIconBadge({ icon }: { icon: CourseIcon }) {
    if ("glyph" in icon) return <span className="course-tile__badge text-[1.35rem] font-extrabold" aria-hidden="true">{icon.glyph}</span>;
    const Icon = ICONS[icon.icon];
    return <span className="course-tile__badge" aria-hidden="true"><Icon className="w-7 h-7" strokeWidth={1.8} /></span>;
}

const FLAGS: Record<string, "gb" | "kr" | "ru" | "tr"> = {
    "Ingliz tili": "gb",
    "Koreys tili": "kr",
    "Rus tili": "ru",
    "Turk tili": "tr",
};

// Flag or icon in front of a subject's name in the filter
function GroupIcon({ name }: { name: string }) {
    const flag = FLAGS[name];
    if (flag) return <Flag code={flag} className="w-6 h-4 shrink-0 rounded-[3px] shadow-sm ring-1 ring-black/5" />;
    if (name === "Kompyuter kursi") return <Laptop className="w-5 h-5 shrink-0 text-[#3fae2a]" />;
    if (name === "Arab tili") return <MoonStar className="w-5 h-5 shrink-0 text-[#3fae2a]" />;
    if (name === "Robototexnika") return <Bot className="w-5 h-5 shrink-0 text-sky-500" />;
    if (name === "Mental arifmetika") return <Brain className="w-5 h-5 shrink-0 text-violet-500" />;
    return <BookOpen className="w-5 h-5 shrink-0 text-amber-500" />;
}

const CardItems: React.FC<PricesItemProps> = ({ prices, ratings = {} }) => {
    const { t, locale } = useTranslation();
    // Filter by language / subject ("Ingliz tili", "Koreys tili", "Kompyuter kursi"…)
    const [filter, setFilter] = useState("all");
    const groups = Array.from(
        prices.reduce((m, p) => m.set(p.courseName, (m.get(p.courseName) ?? 0) + 1), new Map<string, number>())
    );
    const shown = filter === "all" ? prices : prices.filter((p) => p.courseName === filter);
    // The main subjects get their own chip (in this order), the rest go under "Boshqa kurslar"
    const names = groups.map(([g]) => g);
    const primary = PRIMARY.filter((g) => names.includes(g));
    const others = names.filter((g) => !PRIMARY.includes(g));
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!moreOpen) return;
        const close = (e: Event) => {
            if (e instanceof KeyboardEvent ? e.key === "Escape" : !moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", close);
        };
    }, [moreOpen]);

    return (
        <div className="mt-6 mb-16">
            {groups.length > 1 && (
                <div className="course-filters" role="group">
                    <button onClick={() => setFilter("all")} aria-pressed={filter === "all"} className={cn("course-filter", filter === "all" && "is-active")}>
                        {t("courseFilterAll")}
                    </button>
                    {primary.map((g) => (
                        <button key={g} onClick={() => setFilter(g)} aria-pressed={filter === g} className={cn("course-filter", filter === g && "is-active")}>
                            <GroupIcon name={g} />
                            {t(CHIP_LABELS[g] ?? g)}
                        </button>
                    ))}
                    {others.length > 0 && (
                        <div className="relative" ref={moreRef}>
                            <button
                                onClick={() => setMoreOpen((o) => !o)}
                                aria-expanded={moreOpen}
                                className={cn("course-filter", others.includes(filter) && "is-active")}
                            >
                                {others.includes(filter) ? <GroupIcon name={filter} /> : <MoreHorizontal className="w-5 h-5 text-zinc-500" />}
                                {others.includes(filter) ? t(filter) : t("courseFilterMore")}
                                <ChevronDown className={cn("w-4 h-4 transition-transform", moreOpen && "rotate-180")} />
                            </button>
                            {moreOpen && (
                                <div className="course-filter-menu animate-in fade-in slide-in-from-top-2 duration-200">
                                    {others.map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => { setFilter(g); setMoreOpen(false); }}
                                            aria-pressed={filter === g}
                                            className={cn("course-filter-menu__item", filter === g && "is-active")}
                                        >
                                            <GroupIcon name={g} />
                                            {t(g)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shown.map((price, index) => {
                    const slug = courseSlug(price);
                    const href = `/courses/${slug}`;
                    const rating = ratings[slug];
                    const { info, icon } = courseInfo(slug, price.courseName);
                    const title = info ? pickText(info.title, locale) : courseCardTitles(price, t).heading;
                    const fallback = firstSentence(price.description);
                    const summary = info ? pickText(info.summary, locale) : fallback ? t(fallback) : "";
                    return (
                    <article key={`${filter}-${price.id ?? index}`} className="course-card course-tile group">
                        {/* Icon + title; the title link is stretched over the whole card */}
                        <div className={cn("course-tile__head", rating && "pe-14")}>
                            <CourseIconBadge icon={icon} />
                            <h3 className="course-tile__title">
                                <Link href={href} className="after:absolute after:inset-0 after:content-['']">
                                    {title}
                                </Link>
                            </h3>
                        </div>
                        {rating && (
                            <Link
                                href={`${href}#rating`}
                                aria-label={`${rating.average.toFixed(1)} / 5`}
                                className="course-tile__rating"
                            >
                                <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                                {rating.average.toFixed(1)}
                                <span className="text-zinc-400">({rating.count})</span>
                            </Link>
                        )}

                        <p className="course-tile__summary">{summary}</p>

                        <div className="course-tile__price">
                            <div>
                                <p className="text-[1.65rem] leading-tight font-extrabold text-zinc-900 dark:text-white whitespace-nowrap">
                                    {formatPrice(price.courseChegirma, locale)} <span className="text-sm font-semibold text-zinc-500">{t("courseCurrency")}</span>
                                </p>
                                {price.coursePrice > price.courseChegirma && (
                                    <p className="text-sm font-medium line-through text-zinc-400 dark:text-zinc-500" title={price.chegirma ? t(price.chegirma) : undefined}>
                                        {formatPrice(price.coursePrice, locale)} {t("courseCurrency")}
                                    </p>
                                )}
                            </div>
                            {price.courseTime && (
                                <span className="course-tile__hours">
                                    <Clock className="w-4 h-4" />
                                    {formatHours(price.courseTime, locale)} {t("courseTime")}
                                </span>
                            )}
                        </div>

                        {/* Enroll (above the stretched link, so it keeps its own target) */}
                        <Link href={`/contact?course=${encodeURIComponent(courseLabel(price))}`} className="course-tile__enroll">
                            {t("btnEnroll")}
                        </Link>
                    </article>
                    );
                })}
            </div>
        </div>
    );
};
export default CardItems;
