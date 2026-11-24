"use client";

import { ArrowUpRight, Heart, MapPin, MessageSquareText, MousePointerClick, Star } from "lucide-react";
import { googlePlace, yandexPlace } from "@/constants";
import { useTranslation } from "@/context/LanguageContext";
import Logo from "@/components/shared/logo";

// /mapssharx — "rate us" card: one big option card per map, plus a 3-step hint.
// Icon tiles use each map's colours (our own pin icon, not the brands' logos).
function MapsReviewContent() {
  const { t } = useTranslation();

  const maps = [
    {
      href: googlePlace.reviewUrl,
      name: "Google Maps",
      sub: t("mapsPageGoogleSub"),
      tile: "maps-tile--google",
      ring: "hover:border-[#4285F4] focus-visible:border-[#4285F4]",
      glow: "group-hover:shadow-[0_18px_40px_-18px_#4285F4]",
    },
    {
      href: yandexPlace.reviewUrl,
      name: "Yandex Maps",
      sub: t("mapsPageYandexSub"),
      tile: "maps-tile--yandex",
      ring: "hover:border-[#FC3F1D] focus-visible:border-[#FC3F1D]",
      glow: "group-hover:shadow-[0_18px_40px_-18px_#FC3F1D]",
    },
  ];

  const steps = [
    { Icon: MousePointerClick, label: t("mapsStep1") },
    { Icon: Star, label: t("mapsStep2") },
    { Icon: MessageSquareText, label: t("mapsStep3") },
  ];

  return (
    <section className="relative flex items-center justify-center pt-28 pb-16 md:pt-36 md:pb-24">
      {/* soft yellow glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[420px] w-[min(720px,100%)] -translate-x-1/2 rounded-full bg-[#FFB800]/20 blur-3xl dark:bg-[#FFB800]/10"
      />

      <div className="w-full max-w-xl">
        <div className="rounded-[2rem] border border-zinc-200 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/90">
          {/* header */}
          <div className="text-center">
            <Logo className="mx-auto mb-6 h-7 text-zinc-950 dark:text-white" />
            <div className="mx-auto mb-5 inline-flex items-center gap-1 rounded-full bg-[#FFB800]/15 px-4 py-2" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="maps-star h-6 w-6 fill-[#FFB800] text-[#FFB800]"
                  style={{ animationDelay: `${n * 90}ms` }}
                />
              ))}
            </div>
            <h1 className="mb-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl dark:text-white">{t("mapsPageTitle")}</h1>
            <p className="mx-auto max-w-md font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">{t("mapsPageLead")}</p>
          </div>

          {/* map options */}
          <div className="mt-8 flex flex-col gap-4">
            {maps.map((m) => (
              <a
                key={m.href}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 rounded-2xl border-2 border-zinc-200 bg-white p-4 outline-none transition-all duration-300 hover:-translate-y-0.5 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950 ${m.ring} ${m.glow}`}
              >
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-md ${m.tile}`}>
                  <MapPin className="h-7 w-7 drop-shadow" strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1 text-start">
                  <span className="block text-lg font-black text-zinc-950 dark:text-white">{m.name}</span>
                  <span className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">{m.sub}</span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-[#FFB800] group-hover:text-black dark:bg-zinc-800 dark:text-zinc-300">
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </span>
              </a>
            ))}
          </div>

          {/* how it works */}
          <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">{t("mapsPageStepsTitle")}</p>
            <ol className="grid grid-cols-3 gap-3">
              {steps.map(({ Icon, label }, i) => (
                <li key={label} className="flex flex-col items-center gap-2 text-center">
                  <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#FFB800]/15 text-[#c98f00] dark:text-[#FFB800]">
                    <Icon className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#FFB800] text-[10px] font-black text-black ring-2 ring-white dark:ring-zinc-900">
                      {i + 1}
                    </span>
                  </span>
                  <span className="text-xs font-bold leading-tight text-zinc-700 sm:text-sm dark:text-zinc-300">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-zinc-500">
          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
          {t("mapsPageNote")}
        </p>
      </div>
    </section>
  );
}

export default MapsReviewContent;
