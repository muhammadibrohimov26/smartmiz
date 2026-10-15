"use client";

import { Headphones, Play } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { TelegramMediaKind } from "@/types";

// Video/voice feedback sent through the Telegram bot is not stored on the
// site; the card links to the channel post where it plays.
export default function TelegramMediaLink({ link, media }: { link?: string; media?: TelegramMediaKind }) {
  const { t } = useTranslation();
  if (!link || !media) return null;
  const audio = media === "voice" || media === "audio";
  const Icon = audio ? Headphones : Play;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-[#229ED9] text-white text-sm font-bold hover:bg-[#1c8cc2] transition-colors"
    >
      <Icon className={audio ? "w-4 h-4" : "w-4 h-4 fill-white"} />
      {t(audio ? "tgListen" : "tgWatch")}
    </a>
  );
}
