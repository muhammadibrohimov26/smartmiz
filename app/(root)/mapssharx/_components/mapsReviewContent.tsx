"use client";

import { ExternalLink, MapPin, Star } from "lucide-react";
import { googlePlace, yandexPlace } from "@/constants";
import { useTranslation } from "@/context/LanguageContext";

// /mapssharx — centred card with a big "rate us" button for each map
function MapsReviewContent() {
  const { t } = useTranslation();
  const links = [
    { href: googlePlace.reviewUrl, label: t("mapsPageGoogle"), className: "home-btn home-btn--solid" },
    { href: yandexPlace.reviewUrl, label: t("mapsPageYandex"), className: "home-btn home-btn--outline" },
  ];

  return (
    <section className="min-h-[80vh] flex items-center justify-center pt-32 pb-16 md:pt-36">
      <div className="w-full max-w-xl text-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800">
        <div className="flex justify-center gap-1 mb-6" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className="w-9 h-9 fill-[#FFB800] text-[#FFB800]" />
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white mb-4">{t("mapsPageTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-8">{t("mapsPageLead")}</p>

        <div className="flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`${l.className} w-full`}>
              <MapPin className="w-5 h-5 shrink-0" />
              {l.label}
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium text-zinc-500">{t("mapsPageNote")}</p>
      </div>
    </section>
  );
}

export default MapsReviewContent;
