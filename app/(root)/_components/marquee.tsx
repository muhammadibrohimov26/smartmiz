"use client";

import { Sparkle } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { translatedCourseLabel, uniqueCourses } from "@/lib/courses";
import { Price } from "@/types";

// Two endless strips under the hero: our courses (solid) and the exams we
// prepare for (outlined), running in opposite directions; paused on hover.
const EXAMS = ["IELTS", "CEFR", "TOPIK", "EPS-TOPIK"];

function Strip({ items, outline, reverse }: { items: string[]; outline?: boolean; reverse?: boolean }) {
  // the list twice, so the loop (-50%) is seamless; repeated up to a full width
  const row = items.length < 6 ? [...items, ...items, ...items] : items;
  return (
    <div className="marquee overflow-hidden py-3">
      <div className={`marquee__track${reverse ? " marquee__track--reverse" : ""}`} aria-hidden={reverse}>
        {[...row, ...row].map((item, i) => (
          <span key={i} className="flex items-center gap-6 pe-6 whitespace-nowrap">
            <span
              className={
                outline
                  ? "text-3xl md:text-5xl font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgb(161_161_170/0.7)] hover:[-webkit-text-stroke:1.5px_#FFB800] transition-all"
                  : "text-3xl md:text-5xl font-black uppercase tracking-tighter bw-text hover:text-[#FFB800] transition-colors"
              }
            >
              {item}
            </span>
            <Sparkle className={`w-6 h-6 shrink-0 ${i % 2 ? "text-[#FFB800]" : "text-violet-400"} fill-current`} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee({ prices }: { prices: Price[] }) {
  const { t } = useTranslation();
  const courses = uniqueCourses(prices).map((c) => translatedCourseLabel(c, t));
  if (!courses.length) return null;
  return (
    <section data-reveal="blur" className="relative -mx-4 sm:mx-0 py-6 -rotate-1">
      <Strip items={courses} />
      <Strip items={EXAMS} outline reverse />
    </section>
  );
}
