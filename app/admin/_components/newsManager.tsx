"use client";

import { FormEvent, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { NewsItem } from "@/types";
import { deleteNews, saveNews } from "../actions";
import { Field, FormActions, ImageField, PageHeader, TextArea } from "./fields";

function NewsManager({ news }: { news: NewsItem[] }) {
  const [editing, setEditing] = useState<NewsItem | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const current = editing === "new" ? undefined : editing ?? undefined;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveNews(formData);
      if (!res.success) return void toast.error(res.error);
      toast.success("Natija saqlandi");
      setEditing(null);
    });
  }

  function onDelete(item: NewsItem) {
    if (!confirm(`${item.name} natijasini o'chirasizmi?`)) return;
    startTransition(async () => {
      const res = await deleteNews(item.id);
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
          <ImageField defaultValue={current?.image} />
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
              className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
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
              </div>
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
