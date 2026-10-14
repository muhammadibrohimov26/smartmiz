"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, UserCredential } from "firebase/auth";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { clientAuth } from "@/lib/firebase/client";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const configured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Signs in with Firebase, then exchanges the ID token for the admin session cookie.
  // The server only accepts accounts with the { admin: true } claim.
  async function signInWith(getCredential: () => Promise<UserCredential>) {
    setLoading(true);
    try {
      const cred = await getCredential();
      // The admin session lives in an httpOnly cookie. The browser Firebase session is
      // kept, so the admin stays signed in on the public site too (and can use the
      // "Admin panel" shortcut there).
      const res = await login(await cred.user.getIdToken());

      if (!res.success) throw new Error(res.error);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        toast.error(
          code === "auth/invalid-credential" || code === "auth/wrong-password"
            ? "Email yoki parol noto'g'ri (hisob Google orqali ochilgan bo'lsa, \"Google bilan kirish\"ni bosing)"
            : error instanceof Error ? error.message : "Kirishda xatolik"
        );
      }
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    signInWith(() =>
      signInWithEmailAndPassword(clientAuth(), String(form.get("email")), String(form.get("password")))
    );
  }

  function onGoogle() {
    signInWith(() => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      return signInWithPopup(clientAuth(), provider);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-3xl shadow-[6px_6px_0px_0px_rgba(255,184,0,1)]"
      >
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFB800] flex items-center justify-center">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Admin panel</h1>
        </div>

        {!configured && (
          <p className="text-sm text-red-500 font-medium">
            Firebase sozlanmagan: .env.local faylini to&apos;ldiring.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Parol</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required disabled={loading} />
        </div>

        <button
          type="submit"
          disabled={loading || !configured}
          className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-[#FFB800] dark:hover:bg-[#FFB800] hover:text-black transition-colors disabled:opacity-50"
        >
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          yoki
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading || !configured}
          className="w-full py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 font-bold hover:border-[#FFB800] transition-colors disabled:opacity-50"
        >
          Google bilan kirish
        </button>
      </form>
    </div>
  );
}

export default AdminLoginForm;
