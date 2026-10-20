"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { useCustomerAuth } from "@/components/providers/customer-auth";
import { useTranslation } from "@/context/LanguageContext";
import { telegramSignIn, TelegramAuthData } from "@/lib/telegramLogin";
import { cn } from "@/lib/utils";

// Sign-in dialog for visitors: Google or Telegram (Login Widget of the reviews
// bot — its domain must be set in @BotFather with /setdomain).

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// The visitor just closed the Google popup
const CANCELLED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"];

declare global {
  interface Window {
    onSmartmizTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

function TelegramButton({ onError }: { onError: (key: string) => void }) {
  const { signInWithToken } = useCustomerAuth();
  const { t, locale } = useTranslation();
  const box = useRef<HTMLDivElement>(null);
  const [bot, setBot] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  // Latest callbacks for the widget's global handler (the script is added once)
  const handlers = useRef({ signInWithToken, onError });
  handlers.current = { signInWithToken, onError };

  // The bot's username (null: Telegram login is not set up)
  useEffect(() => {
    fetch("/api/telegram")
      .then((r) => r.json())
      .then((s) => setBot(s.valid ? s.bot : null))
      .catch(() => setBot(null));
  }, []);

  useEffect(() => {
    if (!bot || !box.current) return;
    window.onSmartmizTelegramAuth = async (data) => {
      setBusy(true);
      try {
        const res = await telegramSignIn(data);
        if (!res.success) return handlers.current.onError(res.error);
        await handlers.current.signInWithToken(res.token);
      } catch {
        handlers.current.onError("errLogin");
      } finally {
        setBusy(false);
      }
    };
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", bot);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-lang", locale);
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", "onSmartmizTelegramAuth(user)");
    const target = box.current;
    target.appendChild(script);
    return () => {
      target.innerHTML = "";
      delete window.onSmartmizTelegramAuth;
    };
  }, [bot, locale]);

  if (bot === null) return null;
  return (
    <div className="relative flex justify-center min-h-[44px]">
      <div ref={box} className={cn(busy && "opacity-30 pointer-events-none")} />
      {(bot === undefined || busy) && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-bold text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          {bot === undefined ? t("loginTelegramLoading") : ""}
        </span>
      )}
    </div>
  );
}

export default function LoginDialog({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle } = useCustomerAuth();
  const { t } = useTranslation();
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  async function google() {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      if (CANCELLED.includes(code)) return;
      console.error("Google sign-in failed:", err);
      setError("errLogin");
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("loginTitle")}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-sm bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
      >
        <button onClick={onClose} aria-label={t("close")} className="absolute top-4 end-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black bw-text mb-1">{t("loginTitle")}</h2>
        <p className="text-sm font-medium text-zinc-500 mb-6">{t("loginSubtitle")}</p>

        <div className="space-y-3">
          <button
            onClick={google}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 font-bold text-sm hover:border-[#FFB800] transition-colors"
          >
            <GoogleIcon />
            {t("authLoginGoogle")}
          </button>
          <TelegramButton onError={setError} />
        </div>
        {error && <p className="mt-4 text-sm font-bold text-red-500 text-center">{t(error)}</p>}
      </div>
    </div>,
    document.body
  );
}
