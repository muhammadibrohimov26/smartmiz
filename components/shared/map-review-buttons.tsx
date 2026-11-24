"use client";

import { ExternalLink, Star } from "lucide-react";
import { googlePlace, yandexPlace } from "@/constants";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// "Leave a review" buttons for Smartmiz's Google Maps and Yandex Maps listings
function MapReviewButtons({ className }: { className?: string }) {
  const { t } = useTranslation();
  const links = [
    { href: googlePlace.reviewUrl, label: t("mapReview") },
    { href: yandexPlace.reviewUrl, label: t("mapReviewYandex") },
  ];

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="contact-map-btn">
          <Star className="w-4 h-4" />
          {l.label}
          <ExternalLink className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}

export default MapReviewButtons;
