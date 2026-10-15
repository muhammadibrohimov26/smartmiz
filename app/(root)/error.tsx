"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

// Shown instead of a blank page when a public page fails to render
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();
  useEffect(() => console.error(error), [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#FFB800] flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-2xl font-black bw-text mb-3">{t("errorTitle")}</h1>
        <p className="text-zinc-500 font-medium mb-8">{t("errorDesc")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 bw-button-solid font-bold">
            <RotateCcw className="w-4 h-4" />
            {t("errorRetry")}
          </button>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bw-button-outline font-bold">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("notFoundHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
