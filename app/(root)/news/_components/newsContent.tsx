"use client";

import { useTranslation } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { Trophy, Star, Quote, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  id: string;
  name: string;
  course: string;
  result: string;
  score: string;
  image: string;
  date: string;
  quote: string;
}

const courseColors: Record<string, string> = {
  "IELTS": "bg-blue-500",
  "TOPIK": "bg-red-500",
  "CEFR": "bg-purple-500",
  "EPS-TOPIK": "bg-emerald-500",
  "C1 Rus tili": "bg-orange-500",
  "Roboto texnika": "bg-yellow-500",
};

function NewsPage() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/news.json")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mt-28 md:mt-32 max-w-6xl mx-auto px-4 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm font-bold bw-text mb-6">
          <Sparkles className="w-4 h-4 yellow-accent animate-pulse" />
          <span>O&apos;quvchilarimiz Muvaffaqiyatlari</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black bw-text tracking-tighter uppercase mb-4">
          Yutuqlar va <span className="yellow-accent">Natijalar</span>
        </h1>
        <div className="w-24 h-1.5 bg-[#FFB800] mx-auto rounded-full mb-6" />
        <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg font-medium leading-relaxed">
          Smartmiz o&apos;quvchilarining real hayotdagi muvaffaqiyatlari. Ularning g&apos;alabasi — bizning g&apos;alabamiz!
        </p>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-3 gap-4 mb-16">
        {[
          { label: "IELTS 7+", count: "23", icon: "🇬🇧" },
          { label: "TOPIK 4-6", count: "47", icon: "🇰🇷" },
          { label: "CEFR C1+", count: "31", icon: "🌍" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl p-4 text-center hover:shadow-[3px_3px_0px_0px_rgba(255,184,0,1)] transition-all duration-300">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl md:text-3xl font-black bw-text">{stat.count}</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* SUCCESS CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(255,184,0,1)] transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Card Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl border-3 border-zinc-900 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <img src={item.image} alt={item.course} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wider ${courseColors[item.course] || "bg-zinc-800"}`}>
                      {item.course}
                    </span>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.date).toLocaleDateString("uz-UZ")}</span>
                    </div>
                  </div>
                </div>

                {/* Name & Result */}
                <h3 className="font-black text-lg bw-text mb-1">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FFB800]" />
                  <span className="font-bold text-sm text-[#FFB800]">{item.result}</span>
                </div>
              </div>

              {/* Quote */}
              <div className="px-6 pb-6 flex-1 flex flex-col justify-between">
                <div className="relative bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                  <Quote className="w-4 h-4 text-[#FFB800] mb-2 opacity-60" />
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-medium italic">
                    {item.quote}
                  </p>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-800 rounded-3xl p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
        <h2 className="text-3xl md:text-4xl font-black bw-text uppercase tracking-tighter mb-4">
          Siz ham <span className="yellow-accent">Muvaffaqiyatga</span> Erishasiz!
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 max-w-xl mx-auto">
          Smartmizda o&apos;qish boshla. 10+ yillik tajriba va 11,000+ muvaffaqiyatli bitiruvchilar sifatida biz sizga ham yordam beramiz!
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bw-button-solid font-black text-lg uppercase tracking-wider"
        >
          Hoziroq Yozilish
          <Sparkles className="w-5 h-5 yellow-accent" />
        </Link>
      </div>

    </div>
  );
}

export default NewsPage;
