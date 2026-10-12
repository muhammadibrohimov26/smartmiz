"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/components/providers/customer-auth";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// Errors that just mean the visitor closed the Google popup
const CANCELLED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"];

export function useGoogleSignIn() {
  const { signIn } = useCustomerAuth();
  const { t } = useTranslation();
  return async () => {
    try {
      await signIn();
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      if (!CANCELLED.includes(code)) {
        console.error("Google sign-in failed:", error);
        toast.error(t("errLogin"));
      }
    }
  };
}

export function CustomerAvatar({ name, photo, className }: { name: string; photo?: string | null; className?: string }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" referrerPolicy="no-referrer" className={cn("rounded-full object-cover", className)} />;
  }
  return (
    <span className={cn("rounded-full bg-[#FFB800] text-black font-black flex items-center justify-center", className)}>
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

function CustomerMenu() {
  const { user, ready, enabled, signOut } = useCustomerAuth();
  const signIn = useGoogleSignIn();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!enabled || !ready) return null;

  if (!user) {
    return (
      <button
        onClick={signIn}
        aria-label={t("authLoginGoogle")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-wider bg-white dark:bg-zinc-950 hover:border-[#FFB800] transition-colors"
      >
        <LogIn className="w-3.5 h-3.5 yellow-accent rtl:rotate-180" />
        <span className="hidden sm:inline">{t("authLogin")}</span>
      </button>
    );
  }

  const name = user.displayName || user.email || "";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={name} className="block">
        <CustomerAvatar name={name} photo={user.photoURL} className="w-9 h-9 border-2 border-[#FFB800]" />
      </button>
      {open && (
        <div className="absolute top-11 end-0 w-56 bg-white dark:bg-zinc-950 border border-zinc-900 dark:border-zinc-800 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-3 z-50">
          <p className="text-sm font-black truncate">{user.displayName}</p>
          <p className="text-xs text-zinc-500 truncate mb-3">{user.email}</p>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 rtl:rotate-180" />
            {t("authLogout")}
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerMenu;
