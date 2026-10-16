import { timingSafeEqual } from "crypto";
import { isBotConfigured, tg, webhookSecret } from "@/lib/bot/api";
import { handleUpdate } from "@/lib/bot/flow";

// Telegram webhook of the results/reviews bot (set up from the admin panel:
// Telegram bot → "Botni ulash"). Telegram signs each call with the secret token.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function validSecret(header: string | null) {
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(webhookSecret());
  return a.length === b.length && timingSafeEqual(a, b);
}

// Setup check (no secrets): is REVIEW_BOT_TOKEN set on this deployment and
// does Telegram accept it? Answers with the bot's public username only.
export async function GET() {
  if (!isBotConfigured()) return Response.json({ configured: false });
  try {
    const me = await tg<{ username: string }>("getMe");
    return Response.json({ configured: true, valid: true, bot: me.username });
  } catch {
    return Response.json({ configured: true, valid: false });
  }
}

export async function POST(request: Request) {
  if (!isBotConfigured() || !validSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("forbidden", { status: 403 });
  }
  try {
    await handleUpdate(await request.json());
  } catch (error) {
    // Still 200: otherwise Telegram re-sends the same update again and again
    console.error("Telegram update failed:", error);
  }
  return Response.json({ ok: true });
}
