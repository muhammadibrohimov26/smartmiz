"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { login } from "@/app/admin/actions";
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
  const { user, isAdmin, ready, enabled, signOut, getIdToken } = useCustomerAuth();
  const signIn = useGoogleSignIn();
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // One click into the admin panel: reuse the Google sign-in the visitor already
  // has on the site to create the admin session cookie (no second login, no popup)
  async function openAdmin() {
    setOpening(true);
    try {
      const token = await getIdToken();
      const res = token ? await login(token) : { success: false as const, error: "" };
      if (!res.success) {
        toast.error(t("errLogin"));
        return;
      }
      setOpen(false);
      router.push("/admin");
    } finally {
      setOpening(false);
    }
  }

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
        className="flex items-center justify-center gap-1.5 min-w-10 px-3 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-wider bg-white dark:bg-zinc-950 hover:border-[#FFB800] transition-colors"
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
        <CustomerAvatar name={name} photo={user.photoURL} className="w-10 h-10 border-2 border-[#FFB800]" />
      </button>
      {open && (
        <div className="absolute top-11 end-0 w-56 bg-white dark:bg-zinc-950 border border-zinc-900 dark:border-zinc-800 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-3 z-50">
          <p className="text-sm font-black truncate">{user.displayName}</p>
          <p className="text-xs text-zinc-500 truncate mb-3">{user.email}</p>
          {isAdmin && (
            <button
              onClick={openAdmin}
              disabled={opening}
              className="w-full flex items-center gap-2 px-2 py-2 mb-1 rounded-lg text-sm font-bold bg-[#FFB800]/15 text-yellow-700 dark:text-yellow-400 hover:bg-[#FFB800]/25 disabled:opacity-60"
            >
              {opening ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {t("adminPanel")}
            </button>
          )}
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
