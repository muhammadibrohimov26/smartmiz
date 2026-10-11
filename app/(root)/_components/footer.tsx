"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { branches } from "@/constants";

const phones = [
  { href: "tel:+998732441333", label: "+998 73 244 13 33" },
  { href: "tel:+998732440099", label: "+998 73 244 00 99" },
];

function Footer() {
  const { t } = useTranslation();

  return (
    <div className="w-full py-8 border-t border-gray-200 dark:border-zinc-800 bg-transparent mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 mb-6 border-b border-gray-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 mt-0.5 shrink-0 yellow-accent" />
            <div className="flex flex-col gap-1">
              {phones.map((p) => (
                <a key={p.href} href={p.href} dir="ltr" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  {p.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 yellow-accent" />
            <div className="flex flex-col gap-1">
              {branches.map((b) => (
                <a
                  key={b.house}
                  href={b.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  {t("footerAddress", { house: b.house })}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 mt-0.5 shrink-0 yellow-accent" />
            <span>{t("footerHours")}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold bw-text uppercase tracking-widest text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} {t("footerRights")}</p>
          </div>
          <div className="flex gap-6">
            <a target='_blank' href="https://www.instagram.com/smartmiz_fergana" className="hover:scale-110 hover:brightness-110 transition-transform">
              <img src="/img/instagram.png" alt="Instagram" className="w-6 h-6 grayscale hover:grayscale-0" />
            </a>
            <a target='_blank' href="https://t.me/Smartmiz" className="hover:scale-110 hover:brightness-110 transition-transform">
              <img src="/img/telegram.png" alt="Telegram" className="w-6 h-6 grayscale hover:grayscale-0" />
            </a>
            <a target='_blank' href="https://www.youtube.com/@smartmizoquvmarkazi7835" className="hover:scale-110 hover:brightness-110 transition-transform">
              <img src="/img/youtube.png" alt="Youtube" className="w-6 h-6 grayscale hover:grayscale-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
