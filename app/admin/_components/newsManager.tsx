"use client";

import { FormEvent, useState, useTransition } from "react";
import { Check, EyeOff, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resultLanguage } from "@/lib/results";
import { NewsItem, ReviewStatus } from "@/types";
import { deleteNews, saveNews, sendNewsToChannel, setNewsStatus } from "../actions";
import { callAction } from "./callAction";
import { Field, FormActions, ImageField, PageHeader, TextArea } from "./fields";

const OTHER = "other";

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; count: number }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 text-xs font-bold text-zinc-500">{label}:</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-800",
            value === o.value && "bg-[#FFB800] text-black border-[#FFB800]"
          )}
        >
          {o.label} <span className="opacity-60">{o.count}</span>
        </button>
      ))}
    </div>
  );
}

function NewsManager({ news }: { news: NewsItem[] }) {
  const [editing, setEditing] = useState<NewsItem | "new" | null>(null);
  // List filters: language (as on the public results page) and channel status
  const [langFilter, setLangFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const langOf = (item: NewsItem) => resultLanguage(item) || OTHER;
  const langCounts = new Map<string, number>();
  for (const item of news) langCounts.set(langOf(item), (langCounts.get(langOf(item)) ?? 0) + 1);
  const languages = Array.from(langCounts).sort((a, b) => (a[0] === OTHER ? 1 : b[0] === OTHER ? -1 : b[1] - a[1]));
  const byLanguage = langFilter === "all" ? news : news.filter((item) => langOf(item) === langFilter);
  const visible =
    channelFilter === "all" ? byLanguage : byLanguage.filter((item) => (channelFilter === "sent") === !!item.telegramLink);
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

  function sendToChannel(item: NewsItem) {
    if (item.telegramLink && !confirm(`${item.name} natijasi kanalda bor. Yana bir marta joylaysizmi?`)) return;
    startTransition(async () => {
      const res = await callAction(() => sendNewsToChannel(item.id));
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
          <div className="sm:col-span-2 space-y-1">
            <Field label="Tartib raqami (tepaga qadash)" name="order" type="number" defaultValue={current?.order} placeholder="Bo'sh — avtomatik" />
            <p className="text-xs text-zinc-500">
              1 — eng tepada, 2 — undan keyin… Bo&apos;sh qolsa, natijalar avtomatik tartiblanadi: avval daraja (C1 → B2 → B1,
              TOPIK 4 → 3 → 2), keyin ball, keyin sana.
            </p>
          </div>
          <TextArea label="Natija matni" name="result" defaultValue={current?.result} />
          <TextArea label="O'quvchi fikri" name="quote" defaultValue={current?.quote} />
          <p className="sm:col-span-2 -mt-2 text-xs text-zinc-500">
            &quot;result1&quot;, &quot;quote1&quot; kabi qiymatlar — barcha tillarga tarjima qilingan matn kalitlari. Oddiy matn yozsangiz, u barcha tillarda shunday ko&apos;rinadi.
          </p>
          <ImageField label="Sertifikat rasmi" defaultValue={current?.image} redact />
          <FormActions pending={pending} onCancel={() => setEditing(null)} />
        </form>
      )}

      {news.length > 0 && (
        <div className="space-y-2 mb-5">
          <FilterRow
            label="Til"
            value={langFilter}
            onChange={setLangFilter}
            options={[
              { value: "all", label: "Hammasi", count: news.length },
              ...languages.map(([lang, n]) => ({ value: lang, label: lang === OTHER ? "Boshqa" : lang, count: n })),
            ]}
          />
          <FilterRow
            label="Kanal"
            value={channelFilter}
            onChange={setChannelFilter}
            options={[
              { value: "all", label: "Hammasi", count: byLanguage.length },
              { value: "sent", label: "Yuborilgan", count: byLanguage.filter((i) => i.telegramLink).length },
              { value: "unsent", label: "Yuborilmagan", count: byLanguage.filter((i) => !i.telegramLink).length },
            ]}
          />
        </div>
      )}

      {news.length === 0 ? (
        <p className="text-zinc-500">Hozircha natijalar yo&apos;q.</p>
      ) : visible.length === 0 ? (
        <p className="text-zinc-500">Bu filtr boʻyicha natija yoʻq.</p>
      ) : (
        <div className="grid gap-3">
          {visible.map((item) => (
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
                <p className="font-black truncate">
                  {item.order && <span className="mr-1.5 text-[#FFB800]" title="Tepaga qadalgan">📌 {item.order}</span>}
                  {item.name}
                </p>
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
              {item.status === "approved" && (
                <button
                  onClick={() => sendToChannel(item)}
                  disabled={pending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
                  title={item.telegramLink ? "Kanalga yana joylash" : "Telegram kanalga joylash"}
                >
                  <Send className="w-3.5 h-3.5" /> {item.telegramLink ? "Qayta" : "Kanalga"}
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
