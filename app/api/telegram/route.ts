import { timingSafeEqual } from "crypto";
import { isBotConfigured, webhookSecret } from "@/lib/bot/api";
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
