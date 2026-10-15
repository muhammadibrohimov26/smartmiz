"use client";

import { FormEvent, ReactNode, useState, useTransition } from "react";
import { CheckCircle2, Circle, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BotStatus } from "@/lib/bot/status";
import { connectBot, createBotAdminLink, removeBotAdminAction, saveBotChannel, saveBotEmojiPack } from "../actions";
import { callAction } from "./callAction";
import { Field, PageHeader } from "./fields";

const card = "p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl";
const button = "px-5 py-2.5 rounded-xl font-bold text-sm bg-[#FFB800] text-black hover:bg-yellow-400 disabled:opacity-50";

function Step({ done, n, title, children }: { done: boolean; n: number; title: string; children: ReactNode }) {
  return (
    <section className={card}>
      <div className="flex items-center gap-2 mb-3">
        {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-zinc-400" />}
        <h2 className="font-black">
          {n}. {title}
        </h2>
      </div>
      <div className="space-y-3 text-sm">{children}</div>
    </section>
  );
}

function BotSettings({ status }: { status: BotStatus }) {
  const [pending, startTransition] = useTransition();
  const [adminLink, setAdminLink] = useState("");

  function act(fn: () => Promise<{ success: true } | { success: false; error: string }>, ok: string) {
    startTransition(async () => {
      const res = await callAction(fn);
      if (!res.success) return void toast.error(res.error);
      toast.success(ok);
    });
  }

  function onForm(action: (fd: FormData) => Promise<{ success: true } | { success: false; error: string }>, ok: string) {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      act(() => action(fd), ok);
    };
  }

  function getAdminLink() {
    startTransition(async () => {
      const res = await callAction(createBotAdminLink);
      if (!res.success) return void toast.error(res.error);
      setAdminLink(res.link);
    });
  }

  const botUrl = status.username ? `https://t.me/${status.username}` : "";

  return (
    <div className="max-w-2xl">
      <PageHeader title="Telegram bot" />
      <p className="text-sm text-zinc-500 mb-6">
        Odamlar bot orqali natija va sharh yuboradi → sizga Telegram&apos;da tasdiqlash tugmalari bilan keladi →
        tasdiqlasangiz saytga va kanalga chiqadi. Natijalar va Sharhlar sahifalarida ham tasdiqlash mumkin.
      </p>

      {status.error && (
        <p className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-600 text-sm font-bold break-all">Telegram xatosi: {status.error}</p>
      )}

      <div className="grid gap-4">
        <Step n={1} done={status.configured && !status.error} title="Bot tokeni">
          {status.configured ? (
            <p>
              Bot: {botUrl ? <a href={botUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">@{status.username}</a> : "—"}
            </p>
          ) : (
            <ol className="list-decimal pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>
                Telegram&apos;da <b>@BotFather</b> → <code>/newbot</code> → nom va username bering (masalan SmartmizBot).
                Premium emoji ishlashi uchun botni <b>Premium</b> akkauntdan oching.
              </li>
              <li>
                BotFather bergan tokenni Vercel → Project → Settings → Environment Variables&apos;ga{" "}
                <code>REVIEW_BOT_TOKEN</code> nomi bilan qo&apos;shing va saytni qayta deploy qiling.
              </li>
            </ol>
          )}
        </Step>

        <Step n={2} done={status.webhookOk} title="Botni saytga ulash">
          {status.webhookOk ? (
            <p>Ulangan ✅{status.pendingUpdates > 0 && ` · navbatda ${status.pendingUpdates} ta xabar`}</p>
          ) : (
            <p className="text-zinc-500">Bot xabarlarni saytga yuborishi uchun bir marta bosing.</p>
          )}
          {status.webhookError && <p className="text-red-500 font-bold break-all">Oxirgi xato: {status.webhookError}</p>}
          <button disabled={pending || !status.configured} onClick={() => act(connectBot, "Bot ulandi")} className={button}>
            {status.webhookOk ? "Qayta ulash" : "Botni ulash"}
          </button>
        </Step>

        <Step n={3} done={status.admins.length > 0} title="Tasdiqlovchi adminlar">
          <p className="text-zinc-500">Yangi natija va sharhlar shu Telegram akkauntlarga keladi.</p>
          {status.admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950">
              <span className="font-bold">{a.name}</span>
              <button
                disabled={pending}
                onClick={() => confirm(`${a.name} ni adminlikdan olib tashlaysizmi?`) && act(() => removeBotAdminAction(a.id), "Olib tashlandi")}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                aria-label="Olib tashlash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button disabled={pending || !status.webhookOk} onClick={getAdminLink} className={button}>
            Admin qo&apos;shish havolasi
          </button>
          {adminLink && (
            <p className="p-3 rounded-xl bg-emerald-500/10">
              Telegram&apos;da oching va <b>Start</b> bosing (15 daqiqa amal qiladi):{" "}
              <a href={adminLink} target="_blank" rel="noopener noreferrer" className="font-bold underline break-all inline-flex items-center gap-1">
                Ochish <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </p>
          )}
        </Step>

        <Step n={4} done={!!status.channelTitle} title="Kanal">
          <p className="text-zinc-500">
            Botni kanalga <b>admin</b> qilib qo&apos;shing (&quot;Xabar joylash&quot; huquqi bilan), keyin kanal manzilini yozing.
          </p>
          {status.channelTitle && <p>Hozir: <b>{status.channelTitle}</b> ({status.channel})</p>}
          <form onSubmit={onForm(saveBotChannel, "Kanal saqlandi")} className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px]">
              <Field label="Kanal" name="channel" defaultValue={status.channel} placeholder="@smartmiz_uz" />
            </div>
            <button disabled={pending || !status.configured} className={button}>Saqlash</button>
          </form>
        </Step>

        <Step n={5} done={status.emojiCount > 0} title="Premium emoji (ixtiyoriy)">
          <p className="text-zinc-500">
            Bot egasi Telegram Premium bo&apos;lsa, bot shaxsiy chatda animatsiyali emoji ishlatadi. Emoji to&apos;plami
            havolasini qo&apos;ying (<code>https://t.me/addemoji/...</code>) — botdagi 🏆 ⭐ 🎉 kabi emoji shu to&apos;plamdagilariga
            almashadi. Kanal postlarida oddiy emoji qoladi (Telegram cheklovi).
          </p>
          {status.emojiCount > 0 && <p>To&apos;plam: <b>{status.emojiPack}</b> · {status.emojiCount} ta emoji</p>}
          <form onSubmit={onForm(saveBotEmojiPack, "Emoji to'plami saqlandi")} className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px]">
              <Field label="Emoji to'plami havolasi" name="emojiPack" defaultValue={status.emojiPack ? `https://t.me/addemoji/${status.emojiPack}` : ""} placeholder="https://t.me/addemoji/..." />
            </div>
            <button disabled={pending || !status.configured} className={button}>Saqlash</button>
          </form>
        </Step>
      </div>
    </div>
  );
}

export default BotSettings;
