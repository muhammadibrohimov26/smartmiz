import { createHmac } from "crypto";

// Minimal Telegram Bot API client for the reviews/results bot (server-only).
// The bot is separate from the lead-notification bot in lib/telegram.ts:
// its token is REVIEW_BOT_TOKEN.

// Overridable only for local end-to-end tests against a fake Bot API
const API = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";

export function botToken() {
  return process.env.REVIEW_BOT_TOKEN?.trim() || "";
}

export function isBotConfigured() {
  return botToken() !== "";
}

// Telegram sends this in X-Telegram-Bot-Api-Secret-Token with every webhook
// call; derived from the token so there is no second secret to configure.
export function webhookSecret() {
  return createHmac("sha256", botToken()).update("smartmiz-webhook").digest("hex").slice(0, 48);
}

export class TelegramError extends Error {
  constructor(public method: string, public description: string) {
    super(`Telegram ${method}: ${description}`);
  }
}

export async function tg<T = any>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const token = botToken();
  if (!token) throw new TelegramError(method, "REVIEW_BOT_TOKEN is not set");
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ ok: false, description: res.statusText }));
  if (!data.ok) throw new TelegramError(method, String(data.description ?? "unknown error"));
  return data.result as T;
}

// Downloads a file the bot received (Telegram allows up to 20 MB via the Bot API)
export async function downloadFile(fileId: string): Promise<Buffer> {
  const file = await tg<{ file_path: string }>("getFile", { file_id: fileId });
  const res = await fetch(`${API}/file/bot${botToken()}/${file.file_path}`, { cache: "no-store" });
  if (!res.ok) throw new TelegramError("downloadFile", res.statusText);
  return Buffer.from(await res.arrayBuffer());
}

export function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- Premium (custom) emoji ----------
// Bots may use custom emoji in private chats and groups when the bot's owner
// has Telegram Premium (not in channels — that needs a Fragment username).
// The admin panel stores a map "🏆" → custom_emoji_id from an emoji pack;
// withPremiumEmoji() swaps those emoji in an HTML message for <tg-emoji> tags.

export function withPremiumEmoji(html: string, emoji: Record<string, string>) {
  const keys = Object.keys(emoji).filter((k) => /^\d+$/.test(emoji[k]));
  if (!keys.length) return html;
  // Longest first, so "❤️" wins over "❤"
  const pattern = new RegExp(keys.sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  return html.replace(pattern, (m) => `<tg-emoji emoji-id="${emoji[m]}">${m}</tg-emoji>`);
}

const stripPremium = (html: string) => html.replace(/<tg-emoji emoji-id="\d+">(.*?)<\/tg-emoji>/g, "$1");

// Sends an HTML message to a private chat with premium emoji when possible;
// if Telegram refuses them (owner without Premium), sends plain emoji instead.
export async function sendHtml(
  chatId: number | string,
  html: string,
  emoji: Record<string, string>,
  extra: Record<string, unknown> = {}
) {
  const fancy = withPremiumEmoji(html, emoji);
  const params = { chat_id: chatId, parse_mode: "HTML", link_preview_options: { is_disabled: true }, ...extra };
  try {
    return await tg<{ message_id: number }>("sendMessage", { ...params, text: fancy });
  } catch (error) {
    if (fancy === html) throw error;
    return tg<{ message_id: number }>("sendMessage", { ...params, text: stripPremium(fancy) });
  }
}
