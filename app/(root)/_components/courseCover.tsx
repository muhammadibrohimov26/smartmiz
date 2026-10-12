"use client";

import { BookOpen, Bot, Brain, Monitor, LucideIcon } from "lucide-react";
import { courseSpecialization } from "@/lib/courses";
import { Price } from "@/types";

// Language-neutral card header drawn in code: a letter in the course
// language's own script (or an icon) — no Uzbek-only text baked into images.

const GLYPHS: Record<string, string> = {
  "Ingliz tili": "Aa",
  "Koreys tili": "한",
  "Rus tili": "Я",
  "Turk tili": "Ğ",
  "Arab tili": "ع",
};

const ICONS: Record<string, LucideIcon> = {
  "Kompyuter kursi": Monitor,
  "Robototexnika": Bot,
  "Mental arifmetika": Brain,
};

function CourseCover({ course }: { course: Price }) {
  const spec = courseSpecialization(course);
  // Short exam names (IELTS, CEFR, EPS, C1) tell same-language courses apart
  const glyph = spec && spec.length <= 5 ? spec : GLYPHS[course.courseName];
  const Icon = ICONS[course.courseName] ?? BookOpen;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#FFB800] overflow-hidden" aria-hidden="true">
      <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full border-[18px] border-black/[0.05]" />

      {/* Badge */}
      <div className="relative w-32 h-32 rounded-full bg-zinc-950 ring-8 ring-white/80 shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
        {glyph ? (
          <span className={`${glyph.length > 2 ? "text-3xl tracking-tight" : "text-5xl"} font-black text-[#FFB800] leading-none`}>{glyph}</span>
        ) : (
          <Icon className="w-14 h-14 text-[#FFB800]" strokeWidth={2.2} />
        )}
      </div>
    </div>
  );
}

export default CourseCover;
