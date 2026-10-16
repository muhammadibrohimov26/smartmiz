import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ReviewStatus, TelegramMediaKind } from "@/types";
import { escapeHtml, isBotConfigured, sendHtml, tg, tgUpload, Upload } from "./api";
import { getBotConfig } from "./config";

// What the Telegram bot collects, and what happens when an admin decides on it
// (from the Telegram buttons or from the admin panel — same code path).
// Results live in "news", reviews in "reviews" (doc id tg_<telegram user id>).

export type Kind = "news" | "review";

export interface TelegramMedia {
  kind: TelegramMediaKind;
  fileId: string;
}

const SITE = "https://www.smartmiz.uz";
const collection = (kind: Kind) => adminDb().collection(kind === "news" ? "news" : "reviews");
const sitePath = (kind: Kind) => (kind === "news" ? "/news" : "/");

function revalidate(kind: Kind) {
  const paths = kind === "news" ? ["/news", "/admin/news", "/admin"] : ["/", "/admin/reviews", "/admin"];
  for (const path of paths) revalidatePath(path);
}

const MEDIA_LABEL: Record<TelegramMediaKind, string> = {
  video: "🎥 Video",
  video_note: "🎥 Dumaloq video",
  voice: "🎙 Ovozli xabar",
  audio: "🎧 Audio",
};

type Doc = FirebaseFirestore.DocumentData;

// ---------- Text of the posts ----------

function summary(kind: Kind, d: Doc) {
  const lines =
    kind === "news"
      ? [
          "🏆 <b>Yangi natija!</b>",
          "",
          `👤 <b>${escapeHtml(d.name)}</b>`,
          `📚 ${escapeHtml(d.course)}: <b>${escapeHtml(d.score)}</b>`,
          d.quote ? `\n💬 <i>${escapeHtml(d.quote)}</i>` : "",
        ]
      : ["⭐".repeat(d.rating), "", `💬 <i>${escapeHtml(d.text)}</i>`, `— <b>${escapeHtml(d.name)}</b>`];
  return lines.filter((l) => l !== "").join("\n").replace(/\n{3,}/g, "\n\n");
}

function channelCaption(kind: Kind, d: Doc) {
  const tags = kind === "news" ? "#natija #smartmiz" : "#sharh #smartmiz";
  const text = `${summary(kind, d)}\n\n${tags}`;
  // Media captions are limited to 1024 characters
  if (text.length <= 1024) return text;
  const cut = (s?: string) => s && s.slice(0, 600) + "…";
  return `${summary(kind, { ...d, quote: cut(d.quote), text: cut(d.text) })}\n\n${tags}`;
}

// ---------- New submission → admins ----------

export async function notifyAdmins(kind: Kind, id: string) {
  const [snap, config] = await Promise.all([collection(kind).doc(id).get(), getBotConfig()]);
  const d = snap.data();
  if (!d || !config.admins.length) return;

  const title = kind === "news" ? "🆕 <b>Yangi natija</b> — tasdiqlash kerak" : "🆕 <b>Yangi sharh</b> — tasdiqlash kerak";
  const from = d.tgUsername ? `@${escapeHtml(d.tgUsername)}` : `<a href="tg://user?id=${d.tgUserId}">profil</a>`;
  const media = d.media ? `\n📎 ${MEDIA_LABEL[d.media.kind as TelegramMediaKind]} — yuqorida` : "";
  const certificate = kind === "news" && d.photoFileId;
  const privacy = certificate
    ? "\n\n⚠️ Sertifikatda pasport raqami yoki QR kod boʻlsa, tasdiqlashdan oldin admin panelda yashiring (Natijalar → ✏️ → «Pasport raqami, QR kodni yashirish»)."
    : "";
  const text = `${title}\n\n${summary(kind, d)}\n\nYuborgan: ${from}${media}${privacy}`;
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Tasdiqlash", callback_data: `ok:${kind === "news" ? "n" : "r"}:${id}` },
        { text: "❌ Rad etish", callback_data: `no:${kind === "news" ? "n" : "r"}:${id}` },
      ],
      ...(certificate ? [[{ text: "✏️ Admin panelda ochish", url: `${SITE}/admin/news` }]] : []),
    ],
  };

  const sent: { chat: number; id: number }[] = [];
  for (const admin of config.admins) {
    try {
      if (d.photoFileId) await tg("sendPhoto", { chat_id: admin.id, photo: d.photoFileId });
      if (d.media) await sendMedia(admin.id, d.media as TelegramMedia);
      const msg = await sendHtml(admin.id, text, config.emoji, { reply_markup: keyboard });
      sent.push({ chat: admin.id, id: msg.message_id });
    } catch (error) {
      console.error("notifyAdmins failed for", admin.id, error);
    }
  }
  await collection(kind).doc(id).update({ adminMessages: sent });
}

function sendMedia(chatId: number | string, media: TelegramMedia, extra: Record<string, unknown> = {}) {
  const method = { video: "sendVideo", video_note: "sendVideoNote", voice: "sendVoice", audio: "sendAudio" }[media.kind];
  const field = media.kind === "video_note" ? "video_note" : media.kind;
  return tg<{ message_id: number }>(method, { chat_id: chatId, [field]: media.fileId, ...extra });
}

// ---------- Channel ----------

async function channelLink(channel: string, messageId: number) {
  const chat = await tg<{ id: number; username?: string }>("getChat", { chat_id: channel });
  if (chat.username) return `https://t.me/${chat.username}/${messageId}`;
  return `https://t.me/c/${String(chat.id).replace(/^-100/, "")}/${messageId}`;
}

// The site's copy of an uploaded image (/media/<id>), for uploading to Telegram
async function siteImage(url: unknown): Promise<Upload | null> {
  const id = typeof url === "string" ? url.match(/^\/media\/([0-9a-f-]{36})$/)?.[1] : undefined;
  if (!id) return null;
  const doc = await adminDb().collection("media").doc(id).get();
  const data = doc.get("data");
  if (!data) return null;
  const type = String(doc.get("contentType") ?? "image/jpeg");
  return { data: Buffer.from(data), type, filename: `sertifikat.${type.split("/")[1] ?? "jpg"}` };
}

// Posts the approved item: the certificate photo and/or video/voice with the
// caption. Returns the link of the main post.
async function postToChannel(kind: Kind, d: Doc, channel: string) {
  const caption = channelCaption(kind, d);
  const html = { parse_mode: "HTML" };
  const media = d.media as TelegramMedia | undefined;
  // The certificate as shown on the site (an admin may have hidden the
  // passport number there), else the photo the bot received
  const upload = await siteImage(d.image);
  const photo: string | undefined = upload ? "attach://cert" : d.photoFileId || undefined;
  const call = <T,>(method: string, params: Record<string, unknown>) =>
    upload ? tgUpload<T>(method, params, { cert: upload }) : tg<T>(method, params);
  let mainId: number;

  if (photo && media?.kind === "video") {
    // Photo + video as one album, caption under the album
    const msgs = await call<{ message_id: number }[]>("sendMediaGroup", {
      chat_id: channel,
      media: [
        { type: "photo", media: photo, caption, ...html },
        { type: "video", media: media.fileId },
      ],
    });
    mainId = msgs[0].message_id;
  } else if (photo) {
    const params = { chat_id: channel, caption, ...html };
    const sent = upload
      ? await tgUpload<{ message_id: number }>("sendPhoto", params, { photo: upload })
      : await tg<{ message_id: number }>("sendPhoto", { ...params, photo });
    mainId = sent.message_id;
    if (media) await sendMedia(channel, media, { reply_parameters: { message_id: mainId } });
  } else if (media && media.kind !== "video_note") {
    mainId = (await sendMedia(channel, media, { caption, ...html })).message_id;
  } else if (media) {
    // Round videos cannot have a caption: the text goes right under them
    mainId = (await sendMedia(channel, media)).message_id;
    await tg("sendMessage", { chat_id: channel, text: caption, ...html, reply_parameters: { message_id: mainId } });
  } else {
    mainId = (await tg("sendMessage", { chat_id: channel, text: caption, ...html })).message_id;
  }
  return { messageId: mainId, link: await channelLink(channel, mainId).catch(() => "") };
}

// ---------- Decision ----------

export interface Decision {
  ok: boolean;
  message: string;
}

// Sets the status; on first approval of a bot submission also posts it to the
// channel and tells the sender. Safe to call twice (never posts twice).
export async function decide(kind: Kind, id: string, status: ReviewStatus, by: string): Promise<Decision> {
  const ref = collection(kind).doc(id);
  const snap = await ref.get();
  const d = snap.data();
  if (!d) return { ok: false, message: "Topilmadi — oʻchirilgan boʻlishi mumkin" };

  await ref.update({ status, decidedBy: by, decidedAt: FieldValue.serverTimestamp() });
  revalidate(kind);

  const fromBot = d.source === "telegram" && isBotConfigured();
  if (!fromBot) return { ok: true, message: status === "approved" ? "Saytga chiqarildi" : "Yashirildi" };

  const config = await getBotConfig();
  let message = status === "approved" ? "✅ Saytga chiqarildi" : "❌ Rad etildi";
  let link: string = d.telegramLink ?? "";

  if (status === "approved" && !d.channelMessageId) {
    if (!config.channel) {
      message += ". Kanal sozlanmagan — admin panel → Telegram bot";
    } else {
      try {
        const post = await postToChannel(kind, d, config.channel);
        link = post.link;
        await ref.update({ channelMessageId: post.messageId, telegramLink: post.link });
        revalidate(kind);
        message += " va kanalga joylandi";
      } catch (error) {
        console.error("postToChannel failed:", error);
        message += `, lekin kanalga joylab boʻlmadi: ${error instanceof Error ? error.message : error}`;
      }
    }
  }

  // Close the buttons on every admin's copy of the request
  const verdict = status === "approved" ? `✅ <b>Tasdiqlandi</b> (${escapeHtml(by)})` : `❌ <b>Rad etildi</b> (${escapeHtml(by)})`;
  for (const m of (d.adminMessages ?? []) as { chat: number; id: number }[]) {
    await tg("editMessageReplyMarkup", { chat_id: m.chat, message_id: m.id, reply_markup: { inline_keyboard: [] } }).catch(() => {});
    await tg("sendMessage", { chat_id: m.chat, text: verdict, parse_mode: "HTML", reply_parameters: { message_id: m.id } }).catch(() => {});
  }

  // Tell the sender (only once, on approval)
  if (status === "approved" && d.tgChatId && !d.senderNotified) {
    const what = kind === "news" ? "Natijangiz" : "Sharhingiz";
    const lines = [`🎉 ${what} saytga chiqdi! Rahmat!`, "", `🌐 ${SITE}${sitePath(kind) === "/" ? "" : sitePath(kind)}`];
    if (link) lines.push(`📢 ${link}`);
    await sendHtml(d.tgChatId, lines.join("\n"), config.emoji).catch(() => {});
    await ref.update({ senderNotified: true });
  }

  return { ok: true, message };
}
