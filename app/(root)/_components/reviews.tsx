"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, LogIn, MessageSquareQuote, Pencil, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { useCustomerAuth } from "@/components/providers/customer-auth";
import { CustomerAvatar } from "@/components/shared/customer-menu";
import TelegramMediaLink from "@/components/shared/telegram-media-link";
import { getMyReview, submitReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import { Review, ReviewStatus } from "@/types";

export function Stars({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
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

export function ReviewCard({ review }: { review: Review }) {
  const date = review.updatedAt ? monthYear(review.updatedAt) : "";
  return (
    <div className="w-full p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl flex flex-col gap-4">
      <Stars value={review.rating} />
      <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-line flex-grow">{review.text}</p>
      <TelegramMediaLink link={review.telegramLink} media={review.media} />
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

// courseSlug: rate that course (course page); without it: review of the centre
export function WriteReview({ courseSlug }: { courseSlug?: string } = {}) {
  const { t } = useTranslation();
  const { user, ready, enabled, getIdToken, signIn } = useCustomerAuth();
  const [mine, setMine] = useState<{ rating: number; text: string; status: ReviewStatus } | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);

  // Load the signed-in customer's own review (if any) to show its status / edit it
  useEffect(() => {
    if (!user) { setMine(null); setRating(0); setText(""); return; }
    let cancelled = false;
    (async () => {
      const token = await getIdToken();
      const review = token ? await getMyReview(token, courseSlug) : null;
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
        <p className="font-bold mb-4">{t(courseSlug ? "courseRateLogin" : "reviewsLoginPrompt")}</p>
        <button onClick={signIn} className="inline-flex items-center gap-2 px-6 py-3 bw-button-solid font-bold">
          <LogIn className="w-5 h-5 rtl:rotate-180" />
          {t("authLogin")}
        </button>
      </div>
    );
  }

  // Once approved: a thank-you card instead of the form (the form returns on "Tahrirlash")
  if (mine?.status === "approved" && !editing) {
    return (
      <ThanksCard
        review={mine}
        name={user.displayName ?? ""}
        photo={user.photoURL ?? ""}
        onEdit={() => setEditing(true)}
        shareUrl={courseSlug ? `${SITE}/courses/${courseSlug}` : `${SITE}/#reviews`}
      />
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) return void toast.error(t("errReviewRating"));
    if (text.trim().length < 10 || text.trim().length > 1000) return void toast.error(t("errReviewText"));
    setSending(true);
    try {
      const token = await getIdToken();
      const res = await submitReview(token ?? "", rating, text, courseSlug);
      if (!res.success) return void toast.error(t(res.error));
      setMine({ rating, text, status: "pending" });
      setEditing(false);
      toast.success(t("reviewsSent"));
    } catch {
      toast.error(t("errorMsg"));
    } finally {
      setSending(false);
    }
  }

  function cancelEdit() {
    if (!mine) return;
    setRating(mine.rating);
    setText(mine.text);
    setEditing(false);
  }

  return (
    <form onSubmit={onSubmit} className="p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-black text-lg">{t(mine ? "reviewsEditTitle" : courseSlug ? "courseRateTitle" : "reviewsWriteTitle")}</h3>
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

      {editing && <p className="text-xs font-medium text-zinc-500">{t("reviewsEditNote")}</p>}

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-zinc-500" dir="ltr">{text.trim().length}/1000</span>
        <div className="flex items-center gap-2">
          {editing && (
            <button type="button" onClick={cancelEdit} disabled={sending} className="px-5 py-3 bw-button-outline font-bold">
              {t("close")}
            </button>
          )}
          <button type="submit" disabled={sending} className="px-6 py-3 bw-button-solid font-bold disabled:opacity-50">
            {sending ? t("loading") : t("reviewsSubmit")}
          </button>
        </div>
      </div>
    </form>
  );
}

const SITE = "https://www.smartmiz.uz";

// Shown to the author once their review is on the site
function ThanksCard({
  review,
  name,
  photo,
  onEdit,
  shareUrl,
}: {
  review: { rating: number; text: string };
  name: string;
  photo: string;
  onEdit: () => void;
  shareUrl: string;
}) {
  const { t } = useTranslation();

  async function share() {
    const text = t("reviewsShareText");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Smartmiz", text, url: shareUrl });
      } catch {
        // the visitor closed the share sheet
      }
      return;
    }
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 rounded-2xl text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="font-black text-xl mb-1">{t("reviewsThanksTitle")}</h3>
      <p className="text-sm text-zinc-500 font-medium mb-6">{t("reviewsThanksDesc")}</p>

      <div className="text-left p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 mb-6">
        <Stars value={review.rating} />
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-line line-clamp-4">{review.text}</p>
        <div className="flex items-center gap-2 mt-3">
          <CustomerAvatar name={name} photo={photo} className="w-7 h-7" />
          <span className="text-xs font-black truncate">{name}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={share} className="inline-flex items-center gap-2 px-6 py-3 bw-button-solid font-bold">
          <Share2 className="w-4 h-4" />
          {t("reviewsShare")}
        </button>
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
          <Pencil className="w-4 h-4" />
          {t("reviewsEdit")}
        </button>
      </div>
    </div>
  );
}

// Review cards drop in from above one after another (with a small bounce)
// when the section scrolls into view.
export function DropInGrid({ reviews }: { reviews: Review[] }) {
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
    <div id="reviews" className="py-24 scroll-mt-24">
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
