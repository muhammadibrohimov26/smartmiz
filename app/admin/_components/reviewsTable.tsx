"use client";

import { useState, useTransition } from "react";
import { Check, EyeOff, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTashkent } from "@/lib/dates";
import { Review, ReviewStatus } from "@/types";
import { deleteReview, setReviewStatus } from "../actions";
import { callAction } from "./callAction";
import { PageHeader } from "./fields";

const filters: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "pending", label: "Tasdiqlash kutilmoqda" },
  { value: "approved", label: "Saytda" },
  { value: "hidden", label: "Yashirilgan" },
  { value: "all", label: "Hammasi" },
];

const statusLabel: Record<ReviewStatus, string> = {
  pending: "Kutilmoqda",
  approved: "Saytda",
  hidden: "Yashirilgan",
};

function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [pending, startTransition] = useTransition();
  const visible = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  function change(review: Review, status: ReviewStatus) {
    startTransition(async () => {
      const res = await callAction(() => setReviewStatus(review.id, status));
      if (!res.success) return void toast.error(res.error);
      toast.success(status === "approved" ? "Sharh saytga chiqarildi" : "Sharh yashirildi");
    });
  }

  function remove(review: Review) {
    if (!confirm(`${review.name} sharhini o'chirasizmi?`)) return;
    startTransition(async () => {
      const res = await callAction(() => deleteReview(review.id));
      if (!res.success) return void toast.error(res.error);
      toast.success("Sharh o'chirildi");
    });
  }

  return (
    <div>
      <PageHeader title="Sharhlar" />

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-bold border border-zinc-200 dark:border-zinc-800",
              filter === f.value && "bg-[#FFB800] text-black border-[#FFB800]"
            )}
          >
            {f.label}
            {f.value !== "all" && ` (${reviews.filter((r) => r.status === f.value).length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-zinc-500">Sharhlar yo&apos;q.</p>
      ) : (
        <div className="grid gap-3">
          {visible.map((review) => (
            <div
              key={review.id}
              className={cn(
                "p-4 bg-white dark:bg-zinc-900 border rounded-2xl",
                review.status === "pending" ? "border-[#FFB800]" : "border-zinc-200 dark:border-zinc-800"
              )}
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <p className="font-black">{review.name}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("w-4 h-4", n <= review.rating ? "fill-[#FFB800] text-[#FFB800]" : "text-zinc-300")} />
                  ))}
                </div>
                <span className="text-xs text-zinc-500">
                  {formatTashkent(review.updatedAt)} · {statusLabel[review.status]}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line mb-3">{review.text}</p>
              <div className="flex flex-wrap gap-2">
                {review.status !== "approved" && (
                  <button
                    onClick={() => change(review, "approved")}
                    disabled={pending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5" /> Saytga chiqarish
                  </button>
                )}
                {review.status !== "hidden" && (
                  <button
                    onClick={() => change(review, "hidden")}
                    disabled={pending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Yashirish
                  </button>
                )}
                <button
                  onClick={() => remove(review)}
                  disabled={pending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" /> O&apos;chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsTable;
