"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageSquareQuote, Star } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { useCustomerAuth } from "@/components/providers/customer-auth";
import { CustomerAvatar, useGoogleSignIn } from "@/components/shared/customer-menu";
import { getMyReview, submitReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import { Review, ReviewStatus } from "@/types";

function Stars({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= value ? "fill-[#FFB800] text-[#FFB800]" : "text-zinc-300 dark:text-zinc-700")} />
      ))}
    </div>
  );
}

// "10.2026" — not Intl: server (Node) and browsers format "uz" dates differently,
// which breaks hydration. UTC so server and visitor time zones agree.
function monthYear(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
}

function ReviewCard({ review }: { review: Review }) {
  const date = review.updatedAt ? monthYear(review.updatedAt) : "";
  return (
    <div className="w-full p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl flex flex-col gap-4">
      <Stars value={review.rating} />
      <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-line flex-grow">{review.text}</p>
      <div className="flex items-center gap-3">
        <CustomerAvatar name={review.name} photo={review.photo} className="w-10 h-10" />
        <div className="min-w-0">
          <p className="font-black text-sm truncate">{review.name}</p>
          {date && <p className="text-xs text-zinc-500" dir="ltr">{date}</p>}
        </div>
      </div>
    </div>
  );
}

const STATUS_KEYS: Record<ReviewStatus, string> = {
  pending: "reviewsStatusPending",
  approved: "reviewsStatusApproved",
  hidden: "reviewsStatusHidden",
};

function WriteReview() {
  const { t } = useTranslation();
  const { user, ready, enabled, getIdToken } = useCustomerAuth();
  const signIn = useGoogleSignIn();
  const [mine, setMine] = useState<{ rating: number; text: string; status: ReviewStatus } | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // Load the signed-in customer's own review (if any) to show its status / edit it
  useEffect(() => {
    if (!user) { setMine(null); setRating(0); setText(""); return; }
    let cancelled = false;
    (async () => {
      const token = await getIdToken();
      const review = token ? await getMyReview(token) : null;
      if (cancelled || !review) return;
      setMine(review);
      setRating(review.rating);
      setText(review.text);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  if (!enabled || !ready) return null;

  if (!user) {
    return (
      <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center">
        <p className="font-bold mb-4">{t("reviewsLoginPrompt")}</p>
        <button onClick={signIn} className="inline-flex items-center gap-2 px-6 py-3 bw-button-solid font-bold">
          <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          {t("authLoginGoogle")}
        </button>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) return void toast.error(t("errReviewRating"));
    if (text.trim().length < 10 || text.trim().length > 1000) return void toast.error(t("errReviewText"));
    setSending(true);
    try {
      const token = await getIdToken();
      const res = await submitReview(token ?? "", rating, text);
      if (!res.success) return void toast.error(t(res.error));
      setMine({ rating, text, status: "pending" });
      toast.success(t("reviewsSent"));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-black text-lg">{t(mine ? "reviewsEditTitle" : "reviewsWriteTitle")}</h3>
        {mine && (
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            mine.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : mine.status === "hidden" ? "bg-zinc-500/10 text-zinc-500" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          )}>
            {t(STATUS_KEYS[mine.status])}
          </span>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-bold mb-2">{t("reviewsRating")}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}/5`}
              aria-pressed={rating === n}
              className="p-0.5"
            >
              <Star className={cn("w-7 h-7 transition-colors", n <= rating ? "fill-[#FFB800] text-[#FFB800]" : "text-zinc-300 dark:text-zinc-700 hover:text-[#FFB800]")} />
            </button>
          ))}
        </div>
      </fieldset>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder={t("reviewsPlaceholder")}
        aria-label={t("reviewsPlaceholder")}
        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#FFB800]"
      />

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-zinc-500" dir="ltr">{text.trim().length}/1000</span>
        <button type="submit" disabled={sending} className="px-6 py-3 bw-button-solid font-bold disabled:opacity-50">
          {sending ? t("loading") : t("reviewsSubmit")}
        </button>
      </div>
    </form>
  );
}

// Review cards drop in from above one after another (with a small bounce)
// when the section scrolls into view.
function DropInGrid({ reviews }: { reviews: Review[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {reviews.map((r, i) => (
        <div
          key={r.id}
          className={cn("flex", play ? "review-drop" : "opacity-0 motion-reduce:opacity-100")}
          style={play ? { animationDelay: `${Math.min(i, 8) * 160}ms` } : undefined}
        >
          <ReviewCard review={r} />
        </div>
      ))}
    </div>
  );
}

function Reviews({ reviews }: { reviews: Review[] }) {
  const { t } = useTranslation();

  return (
    <div className="py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bw-panel text-sm font-bold bw-text mb-6">
          <MessageSquareQuote className="w-4 h-4 yellow-accent" />
          <span>{t("reviewsBadge")}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black bw-text uppercase tracking-tighter">
          {t("reviewsTitle1")} <span className="yellow-accent">{t("reviewsTitle2")}</span>
        </h2>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center text-zinc-500 font-medium mb-10">{t("reviewsEmpty")}</p>
      ) : (
        <DropInGrid reviews={reviews} />
      )}

      <div className="max-w-2xl mx-auto">
        <WriteReview />
      </div>
    </div>
  );
}

export default Reviews;
