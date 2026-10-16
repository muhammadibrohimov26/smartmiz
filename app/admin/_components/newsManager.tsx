"use client";

import { FormEvent, useState, useTransition } from "react";
import { Check, EyeOff, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NewsItem, ReviewStatus } from "@/types";
import { deleteNews, saveNews, setNewsStatus } from "../actions";
import { callAction } from "./callAction";
import { Field, FormActions, ImageField, PageHeader, TextArea } from "./fields";

function NewsManager({ news }: { news: NewsItem[] }) {
  const [editing, setEditing] = useState<NewsItem | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const current = editing === "new" ? undefined : editing ?? undefined;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await callAction(() => saveNews(formData));
      if (!res.success) return void toast.error(res.error);
      toast.success("Natija saqlandi");
      setEditing(null);
    });
  }

  function changeStatus(item: NewsItem, status: ReviewStatus) {
    startTransition(async () => {
      const res = await callAction(() => setNewsStatus(item.id, status));
      if (!res.success) return void toast.error(res.error);
      toast.success(res.message);
    });
  }

  function onDelete(item: NewsItem) {
    if (!confirm(`${item.name} natijasini o'chirasizmi?`)) return;
    startTransition(async () => {
      const res = await callAction(() => deleteNews(item.id));
      if (!res.success) return void toast.error(res.error);
      toast.success("Natija o'chirildi");
    });
  }

  return (
    <div>
      <PageHeader title="Natijalar" onAdd={editing ? undefined : () => setEditing("new")} />

      {editing && (
        <form
          key={current?.id ?? "new"}
          onSubmit={onSubmit}
          className="grid sm:grid-cols-2 gap-4 p-6 mb-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl"
        >
          <h2 className="sm:col-span-2 text-lg font-black">
            {current ? "Natijani tahrirlash" : "Yangi natija"}
          </h2>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <Field label="O'quvchi ismi" name="name" defaultValue={current?.name} required />
          <Field label="Imtihon / kurs" name="course" defaultValue={current?.course} placeholder="IELTS, TOPIK, CEFR..." />
          <Field label="Ball" name="score" defaultValue={current?.score} placeholder="7.5" />
          <Field label="Sana" name="date" type="date" defaultValue={current?.date} />
          <TextArea label="Natija matni" name="result" defaultValue={current?.result} />
          <TextArea label="O'quvchi fikri" name="quote" defaultValue={current?.quote} />
          <p className="sm:col-span-2 -mt-2 text-xs text-zinc-500">
            &quot;result1&quot;, &quot;quote1&quot; kabi qiymatlar — barcha tillarga tarjima qilingan matn kalitlari. Oddiy matn yozsangiz, u barcha tillarda shunday ko&apos;rinadi.
          </p>
          <ImageField label="Sertifikat rasmi" defaultValue={current?.image} redact />
          <FormActions pending={pending} onCancel={() => setEditing(null)} />
        </form>
      )}

      {news.length === 0 ? (
        <p className="text-zinc-500">Hozircha natijalar yo&apos;q.</p>
      ) : (
        <div className="grid gap-3">
          {news.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-wrap sm:flex-nowrap items-center gap-4 p-3 bg-white dark:bg-zinc-900 border rounded-2xl",
                item.status === "pending" ? "border-[#FFB800]" : "border-zinc-200 dark:border-zinc-800",
                item.status === "hidden" && "opacity-60"
              )}
            >
              <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black truncate">{item.name}</p>
                <p className="text-sm text-zinc-500">
                  {item.course} · {item.score} · {item.date}
                </p>
                {(item.status !== "approved" || item.media || item.telegramLink) && (
                  <p className="flex flex-wrap items-center gap-2 mt-1 text-xs font-bold">
                    {item.status === "pending" && <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-700 dark:text-yellow-400">Tasdiqlash kutilmoqda</span>}
                    {item.status === "hidden" && <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500">Yashirilgan</span>}
                    {item.media && <span className="text-zinc-500">{item.media === "voice" || item.media === "audio" ? "🎙 Ovozli xabar" : "🎥 Video"}</span>}
                    {item.telegramLink && (
                      <a href={item.telegramLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:underline">
                        <Send className="w-3 h-3" /> Kanalda
                      </a>
                    )}
                  </p>
                )}
              </div>
              {item.status !== "approved" && (
                <button
                  onClick={() => changeStatus(item, "approved")}
                  disabled={pending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5" /> Tasdiqlash
                </button>
              )}
              {item.status !== "hidden" && (
                <button
                  onClick={() => changeStatus(item, "hidden")}
                  disabled={pending}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Yashirish"
                  title="Saytdan yashirish"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setEditing(item)}
                disabled={pending}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Tahrirlash"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item)}
                disabled={pending}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                aria-label="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsManager;
