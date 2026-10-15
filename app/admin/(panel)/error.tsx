"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Admin pages: show what failed (the admin nav stays) instead of a blank screen
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);

  return (
    <div className="max-w-lg p-6 bg-white dark:bg-zinc-900 border-2 border-red-500/40 rounded-2xl">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
        <h1 className="text-xl font-black">Xatolik yuz berdi</h1>
      </div>
      <p className="text-sm text-zinc-500 mb-1">
        Sahifani yangilab (F5) qaytadan urinib koʻring. Takrorlansa, quyidagi xato matnini yuboring.
      </p>
      <p className="text-xs font-mono text-zinc-400 break-all mb-5">
        {error.message || "Nomaʼlum xato"}
        {error.digest && ` (${error.digest})`}
      </p>
      <button
        onClick={() => (reset(), window.location.reload())}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#FFB800] text-black hover:bg-yellow-400"
      >
        <RotateCcw className="w-4 h-4" />
        Qayta yuklash
      </button>
    </div>
  );
}
