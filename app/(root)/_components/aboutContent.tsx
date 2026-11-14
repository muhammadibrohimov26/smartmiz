"use client";

import { MapPin, Phone, Play } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { Price } from "@/types";
import { branches } from "@/constants";
import { videoPlatform } from "@/lib/video";

const PHONE = "tel:+998732441333";

// The last section of the home page (the old /about page redirects to
// /#about): a photo of the centre (opens the history video when there is
// one), a short text about Smartmiz and its branches.
function AboutContent({ videoUrl, videoImage }: { courses: Price[]; studentCount: number; videoUrl: string; videoImage: string }) {
  const { t } = useTranslation();
  const platform = videoPlatform(videoUrl);

  return (
    <section id="about" className="about-row scroll-mt-24">
      {/* Photo of the centre */}
      <a
        href={videoUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={platform ? `${t("aboutVideoBtn")} (${platform})` : t("aboutVideoCaption")}
        className="about-photo group"
        style={{ backgroundImage: `url(${JSON.stringify(videoImage)})` }}
      >
        {videoUrl && (
          <span className="about-photo__play" aria-hidden="true">
            <Play className="w-6 h-6 fill-current" />
          </span>
        )}
      </a>

      {/* About */}
      <div className="about-text">
        <h2 className="about-text__title">{t("aboutHeading")}</h2>
        <p className="about-text__body">{t("aboutShort")}</p>
      </div>

      {/* Branches */}
      <div className="about-branches">
        <h3 className="about-branches__title">{t("branchesHeading")}</h3>
        {branches.map((b) => (
          <div key={b.house} className="branch-card">
            <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-w-0 flex-1">
              <span className="branch-card__pin"><MapPin className="w-5 h-5" /></span>
              <span className="min-w-0">
                <span className="block font-bold text-zinc-900 dark:text-white">{t("branchName")}</span>
                <span className="block text-sm text-zinc-600 dark:text-zinc-400">{t("branchStreet", { house: b.house })}</span>
              </span>
            </a>
            <a href={PHONE} className="branch-card__call">
              <Phone className="w-4 h-4" />
              {t("navContact")}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutContent;
