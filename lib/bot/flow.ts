import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { deleteMediaUrl, MEDIA_MAX_BYTES, saveMediaBuffer } from "@/lib/media";
import { downloadFile, escapeHtml, sendHtml, tg } from "./api";
import { BotConfig, claimAdminLink, getBotConfig } from "./config";
import { decide, Kind, notifyAdmins, TelegramMedia } from "./moderation";

// The conversation: a visitor sends a result (name → exam → score → certificate
// photo → feedback) or a review (stars → feedback). Video, round video, voice
// or audio feedback is kept as a Telegram file_id (posted to the channel as is);
// the site needs a short text too. State per user in Firestore botSessions/<id>.

type Flow = "news" | "review";
type Step = "name" | "course" | "score" | "photo" | "quote" | "quoteText" | "rating" | "confirm";

interface Session {
  flow: Flow;
  step: Step;
  data: {
    name?: string;
    course?: string;
    score?: string;
    photoFileId?: string;
    photoSize?: number;
    text?: string;
    rating?: number;
    media?: TelegramMedia;
  };
}

// Telegram's update/message objects are large; only the fields used here matter
type Update = any;
type Message = any;

const BTN = {
  result: "🏆 Natija yuborish",
  review: "⭐ Sharh qoldirish",
  cancel: "❌ Bekor qilish",
  skipPhoto: "⏭ Rasmsiz davom etish",
  other: "Boshqa",
};

const MAIN_KEYBOARD = { keyboard: [[{ text: BTN.result }, { text: BTN.review }]], resize_keyboard: true, is_persistent: true };
const CANCEL_ROW = [{ text: BTN.cancel }];
const keyboard = (...rows: string[][]) => ({
  keyboard: [...rows.map((r) => r.map((text) => ({ text }))), CANCEL_ROW],
  resize_keyboard: true,
});

const COURSES = [["IELTS", "CEFR"], ["TOPIK", "EPS-TOPIK"], ["Rus tili", BTN.other]];
const MIN_TEXT = 10;
const MAX_TEXT = 1000;
const MAX_PENDING_RESULTS = 3;
const SUBMIT_COOLDOWN_MS = 60_000;

const sessions = () => adminDb().collection("botSessions");

export async function handleUpdate(update: Update) {
  const config = await getBotConfig();
  if (update.callback_query) return onCallback(update.callback_query, config);
  const msg: Message = update.message;
  // Only private chats; the bot ignores groups and channels it is added to
  if (!msg || msg.chat?.type !== "private" || !msg.from || msg.from.is_bot) return;
  return onMessage(msg, config);
}

// ---------- Messages ----------

async function onMessage(msg: Message, config: BotConfig) {
  const chatId: number = msg.chat.id;
  const text: string = (msg.text ?? "").trim();
  const say = (html: string, markup?: object) => sendHtml(chatId, html, config.emoji, markup ? { reply_markup: markup } : {});

  if (text.startsWith("/start")) {
    const payload = text.split(/\s+/)[1] ?? "";
    if (payload.startsWith("admin_")) return linkAdmin(msg, payload.slice(6), config);
    await sessions().doc(String(msg.from.id)).delete();
    if (payload === "natija") return startFlow(msg, "news", config);
    if (payload === "sharh") return startFlow(msg, "review", config);
    return say(
      `Assalomu alaykum, <b>${escapeHtml(msg.from.first_name ?? "")}</b>! 👋\n\n` +
        "Bu <b>Smartmiz oʻquv markazi</b> boti.\n\n" +
        "🏆 Imtihon natijangiz bilan maqtaning — sertifikat, ball va fikringizni yuboring.\n" +
        "⭐ Yoki markaz haqida sharh qoldiring.\n\n" +
        "🎥 Video, 🎙 ovozli xabar ham yuborishingiz mumkin. Admin tasdiqlagach saytda va kanalimizda chiqadi.",
      MAIN_KEYBOARD
    );
  }
  if (text === "/cancel" || text === BTN.cancel) {
    await sessions().doc(String(msg.from.id)).delete();
    return say("Bekor qilindi. Yana kerak boʻlsa, pastdagi tugmalardan birini tanlang 👇", MAIN_KEYBOARD);
  }
  if (text === "/natija" || text === BTN.result) return startFlow(msg, "news", config);
  if (text === "/sharh" || text === BTN.review) return startFlow(msg, "review", config);
  if (text === "/id") return say(`Telegram ID: <code>${msg.from.id}</code>`);

  const snap = await sessions().doc(String(msg.from.id)).get();
  const session = snap.data() as Session | undefined;
  if (!session) return say("Pastdagi tugmalardan birini tanlang 👇", MAIN_KEYBOARD);
  return onStep(msg, session, config);
}

function fullName(from: any) {
  return [from.first_name, from.last_name].filter(Boolean).join(" ").trim().slice(0, 60);
}

async function save(userId: number, session: Session) {
  await sessions().doc(String(userId)).set({ ...session, updatedAt: FieldValue.serverTimestamp() });
}

async function startFlow(msg: Message, flow: Flow, config: BotConfig) {
  const chatId = msg.chat.id;
  if (flow === "news") {
    await save(msg.from.id, { flow, step: "name", data: {} });
    const name = fullName(msg.from);
    return sendHtml(chatId, "🏆 <b>Natija yuborish</b>\n\n1/5. Ism-familiyangizni yozing:", config.emoji, {
      reply_markup: name ? keyboard([name]) : keyboard(),
    });
  }
  await save(msg.from.id, { flow, step: "rating", data: { name: fullName(msg.from) || "Oʻquvchi" } });
  return sendHtml(chatId, "⭐ <b>Sharh qoldirish</b>\n\nSmartmiz'ni necha yulduz bilan baholaysiz?", config.emoji, {
    reply_markup: {
      inline_keyboard: [[1, 2, 3, 4, 5].map((n) => ({ text: `${n} ⭐`, callback_data: `rate:${n}` }))],
    },
  });
}

function mediaOf(msg: Message): TelegramMedia | null {
  if (msg.video) return { kind: "video", fileId: msg.video.file_id };
  if (msg.video_note) return { kind: "video_note", fileId: msg.video_note.file_id };
  if (msg.voice) return { kind: "voice", fileId: msg.voice.file_id };
  if (msg.audio) return { kind: "audio", fileId: msg.audio.file_id };
  return null;
}

function photoOf(msg: Message): { fileId: string; size: number } | null {
  if (msg.photo?.length) {
    // Largest version that still fits a Firestore media document
    const sizes = [...msg.photo].sort((a: any, b: any) => b.width - a.width);
    const pick = sizes.find((p: any) => (p.file_size ?? 0) <= MEDIA_MAX_BYTES) ?? sizes[sizes.length - 1];
    return { fileId: pick.file_id, size: pick.file_size ?? 0 };
  }
  if (msg.document?.mime_type?.startsWith("image/")) return { fileId: msg.document.file_id, size: msg.document.file_size ?? 0 };
  return null;
}

async function onStep(msg: Message, s: Session, config: BotConfig) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text: string = (msg.text ?? msg.caption ?? "").trim();
  const say = (html: string, markup?: object) => sendHtml(chatId, html, config.emoji, markup ? { reply_markup: markup } : {});
  const feedbackPrompt =
    "✍️ Smartmiz haqida fikringizni yozing.\n\n🎥 Yoki <b>video</b>, <b>dumaloq video</b> yoki 🎙 <b>ovozli xabar</b> yuboring.";

  switch (s.step) {
    case "name":
      if (text.length < 2 || text.length > 60) return say("Ism 2–60 belgidan iborat boʻlsin. Qaytadan yozing:");
      s.data.name = text;
      s.step = "course";
      await save(userId, s);
      return say("2/5. Qaysi imtihon yoki kurs?", keyboard(...COURSES));

    case "course":
      if (text === BTN.other) return say("Imtihon yoki kurs nomini yozing:", keyboard());
      if (text.length < 2 || text.length > 40) return say("Imtihon nomini yozing yoki tugmani tanlang:", keyboard(...COURSES));
      s.data.course = text;
      s.step = "score";
      await save(userId, s);
      return say("3/5. Natijangiz qanday? Ball yoki daraja yozing.\n<i>Masalan: 7.5, B2, 5-daraja</i>", keyboard());

    case "score":
      if (!text || text.length > 30) return say("Natijani qisqa yozing (30 belgigacha). <i>Masalan: 7.5</i>");
      s.data.score = text;
      s.step = "photo";
      await save(userId, s);
      return say(
        "4/5. 📄 Sertifikat rasmini yuboring.\n\n<i>Pasport seriyasi-raqami va QR kod saytda koʻrsatilmaydi — admin ularni yashiradi.</i>",
        keyboard([BTN.skipPhoto])
      );

    case "photo": {
      const photo = photoOf(msg);
      if (!photo && text !== BTN.skipPhoto) return say("Sertifikat rasmini yuboring yoki «Rasmsiz davom etish»ni bosing.", keyboard([BTN.skipPhoto]));
      if (photo) {
        s.data.photoFileId = photo.fileId;
        s.data.photoSize = photo.size;
      }
      s.step = "quote";
      await save(userId, s);
      return say(`5/5. ${feedbackPrompt}`, keyboard());
    }

    case "quote":
    case "quoteText": {
      const media = s.step === "quote" ? mediaOf(msg) : null;
      if (media) {
        s.data.media = media;
        // A caption written under the video counts as the text
        if (text.length >= MIN_TEXT) s.data.text = text.slice(0, MAX_TEXT);
        else {
          s.step = "quoteText";
          await save(userId, s);
          return say("👍 Qabul qilindi! Endi saytda koʻrinadigan <b>1–2 gap</b> yozing — video/ovoz kanalda chiqadi.");
        }
      } else {
        if (mediaOf(msg)) return say("Video/ovoz allaqachon bor 👍 Endi matn yozing.");
        if (text.length < MIN_TEXT) return say(`Fikringizni kamida ${MIN_TEXT} ta belgi bilan yozing.`);
        s.data.text = text.slice(0, MAX_TEXT);
      }
      s.step = "confirm";
      await save(userId, s);
      return showConfirm(chatId, s, config);
    }

    case "rating":
      return say("Yuqoridagi yulduzlardan birini bosing ⭐");

    case "confirm":
      return say("Yuqoridagi «✅ Yuborish» tugmasini bosing yoki «❌ Bekor qilish».");
  }
}

async function showConfirm(chatId: number, s: Session, config: BotConfig) {
  const d = s.data;
  const media = d.media ? `\n📎 ${d.media.kind === "voice" || d.media.kind === "audio" ? "Ovozli xabar" : "Video"} biriktirildi` : "";
  const body =
    s.flow === "news"
      ? `👤 <b>${escapeHtml(d.name!)}</b>\n📚 ${escapeHtml(d.course!)}: <b>${escapeHtml(d.score!)}</b>\n📄 Sertifikat: ${d.photoFileId ? "bor" : "yoʻq"}\n\n💬 <i>${escapeHtml(d.text!)}</i>${media}`
      : `${"⭐".repeat(d.rating!)}\n\n💬 <i>${escapeHtml(d.text!)}</i>\n— <b>${escapeHtml(d.name!)}</b>${media}`;
  await sendHtml(chatId, "Tayyor ✅", config.emoji, { reply_markup: { remove_keyboard: true } });
  return sendHtml(chatId, `<b>Tekshirib koʻring:</b>\n\n${body}`, config.emoji, {
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Yuborish", callback_data: "send" },
        { text: "🔄 Qaytadan", callback_data: "restart" },
      ]],
    },
  });
}

// ---------- Buttons ----------

async function onCallback(q: any, config: BotConfig) {
  const data: string = q.data ?? "";
  const answer = (text = "", alert = false) => tg("answerCallbackQuery", { callback_query_id: q.id, text, show_alert: alert }).catch(() => {});
  const chatId: number | undefined = q.message?.chat?.id;

  // Admin decisions: ok:n:<id> / no:r:<id>
  const decision = data.match(/^(ok|no):([nr]):(.+)$/);
  if (decision) {
    const admin = config.admins.find((a) => a.id === q.from.id);
    if (!admin) return answer("Sizda bu huquq yoʻq", true);
    const kind: Kind = decision[2] === "n" ? "news" : "review";
    const result = await decide(kind, decision[3], decision[1] === "ok" ? "approved" : "hidden", admin.name);
    return answer(result.message.slice(0, 190), !result.ok || result.message.includes("lekin"));
  }

  if (!chatId) return answer();
  const ref = sessions().doc(String(q.from.id));
  const s = (await ref.get()).data() as Session | undefined;
  if (!s) return answer("Eskirgan tugma. /start bosing", true);

  if (data.startsWith("rate:") && s.flow === "review" && s.step === "rating") {
    s.data.rating = Math.min(5, Math.max(1, Number(data.slice(5)) || 5));
    s.step = "quote";
    await save(q.from.id, s);
    await tg("editMessageText", {
      chat_id: chatId,
      message_id: q.message.message_id,
      text: `Bahoyingiz: ${"⭐".repeat(s.data.rating)}`,
    }).catch(() => {});
    await answer();
    return sendHtml(
      chatId,
      "✍️ Smartmiz haqida fikringizni yozing.\n\n🎥 Yoki <b>video</b>, <b>dumaloq video</b> yoki 🎙 <b>ovozli xabar</b> yuboring.",
      config.emoji,
      { reply_markup: keyboard() }
    );
  }

  if (data === "restart") {
    await answer();
    await tg("editMessageReplyMarkup", { chat_id: chatId, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } }).catch(() => {});
    return startFlow({ chat: { id: chatId }, from: q.from }, s.flow, config);
  }

  if (data === "send" && s.step === "confirm") {
    // Remove the buttons first so a double tap cannot submit twice
    await tg("editMessageReplyMarkup", { chat_id: chatId, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } }).catch(() => {});
    try {
      const id = await submit(q.from, chatId, s);
      await ref.delete();
      await answer("Yuborildi ✅");
      await sendHtml(
        chatId,
        "🙏 <b>Rahmat!</b> Yuborildi.\n\nAdmin koʻrib chiqqach, saytda va kanalimizda chiqadi — sizga shu yerda xabar beramiz.",
        config.emoji,
        { reply_markup: MAIN_KEYBOARD }
      );
      await notifyAdmins(s.flow === "news" ? "news" : "review", id).catch((e) => console.error("notifyAdmins:", e));
    } catch (error) {
      const message = error instanceof UserError ? error.message : "Xatolik yuz berdi, birozdan keyin qayta urinib koʻring.";
      if (!(error instanceof UserError)) console.error("bot submit failed:", error);
      await answer(message, true);
      await sendHtml(chatId, message, config.emoji, { reply_markup: MAIN_KEYBOARD });
    }
    return;
  }

  return answer();
}

class UserError extends Error {}

// ---------- Saving ----------

async function storePhoto(fileId: string, size: number) {
  if (size > MEDIA_MAX_BYTES) return ""; // too big for the site; still posted to the channel by file_id
  try {
    const data = await downloadFile(fileId);
    if (data.length > MEDIA_MAX_BYTES) return "";
    const type = data[0] === 0x89 ? "image/png" : data.slice(8, 12).toString() === "WEBP" ? "image/webp" : "image/jpeg";
    return await saveMediaBuffer(data, type);
  } catch (error) {
    console.error("storePhoto failed:", error);
    return "";
  }
}

async function profilePhoto(userId: number) {
  try {
    const res = await tg<{ photos: { file_id: string; file_size?: number; width: number }[][] }>("getUserProfilePhotos", { user_id: userId, limit: 1 });
    const sizes = res.photos[0];
    if (!sizes?.length) return "";
    const small = [...sizes].sort((a, b) => a.width - b.width).find((p) => p.width >= 160) ?? sizes[0];
    return await storePhoto(small.file_id, small.file_size ?? 0);
  } catch {
    return ""; // hidden by privacy settings
  }
}

function todayTashkent() {
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}

async function submit(from: any, chatId: number, s: Session): Promise<string> {
  const d = s.data;
  const common = {
    source: "telegram",
    tgUserId: from.id,
    tgChatId: chatId,
    tgUsername: from.username ?? "",
    status: "pending",
    media: d.media ?? FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (s.flow === "news") {
    const mine = await adminDb().collection("news").where("tgUserId", "==", from.id).where("status", "==", "pending").count().get();
    if (mine.data().count >= MAX_PENDING_RESULTS) {
      throw new UserError("Sizda allaqachon tasdiqlanishi kutilayotgan natijalar bor. Admin koʻrib chiqqach, yana yuborishingiz mumkin.");
    }
    const image = d.photoFileId ? await storePhoto(d.photoFileId, d.photoSize ?? 0) : "";
    const ref = await adminDb().collection("news").add({
      ...common,
      media: d.media ?? null,
      name: d.name,
      course: d.course,
      score: d.score,
      result: d.score,
      quote: d.text,
      date: todayTashkent(),
      image,
      photoFileId: d.photoFileId ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  // Reviews: one per Telegram account, like one per Google account on the site
  const id = `tg_${from.id}`;
  const ref = adminDb().collection("reviews").doc(id);
  const existing = await ref.get();
  const last = existing.get("updatedAt");
  if (last instanceof Timestamp && Date.now() - last.toMillis() < SUBMIT_COOLDOWN_MS) {
    throw new UserError("Biroz kuting va qayta yuboring.");
  }
  const photo = await profilePhoto(from.id);
  const oldPhoto = existing.get("photo");
  await ref.set(
    {
      ...common,
      name: d.name,
      photo,
      rating: d.rating,
      text: d.text,
      // An edited review is moderated and posted again
      channelMessageId: FieldValue.delete(),
      telegramLink: FieldValue.delete(),
      senderNotified: FieldValue.delete(),
      adminMessages: FieldValue.delete(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  );
  if (oldPhoto && oldPhoto !== photo) await deleteMediaUrl(oldPhoto);
  return id;
}

// ---------- Admin linking ----------

async function linkAdmin(msg: Message, code: string, config: BotConfig) {
  const ok = await claimAdminLink(code, { id: msg.from.id, name: fullName(msg.from) || String(msg.from.id) });
  return sendHtml(
    msg.chat.id,
    ok
      ? "✅ Siz bot admini sifatida ulandingiz.\n\nYangi natija va sharhlar shu yerga keladi — «✅ Tasdiqlash» yoki «❌ Rad etish» tugmasini bosasiz."
      : "Havola eskirgan yoki notoʻgʻri. Admin paneldan yangi havola oling.",
    config.emoji,
    { reply_markup: MAIN_KEYBOARD }
  );
}
