"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { navLink } from "@/constants";

// 404 page in the visitor's language, with the main sections linked
export default function NotFoundContent() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#FFB800] flex items-center justify-center">
          <SearchX className="w-10 h-10 text-black" />
        </div>
        <p className="text-6xl font-black yellow-accent mb-2">404</p>
        <h1 className="text-2xl font-black bw-text mb-3">{t("notFoundTitle")}</h1>
        <p className="text-zinc-500 font-medium mb-8">{t("notFoundDesc")}</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bw-button-solid font-bold mb-8">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("notFoundHome")}
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-zinc-500">
          {navLink.slice(1).map((n) => (
            <Link key={n.route} href={n.route} className="hover:text-zinc-950 dark:hover:text-white">
              {t(n.translationKey)}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
