import { SITE_URL } from "@/lib/seo";
import { isBotConfigured, tg } from "./api";
import { BotAdmin, getBotConfig } from "./config";

// Everything the admin panel's Telegram bot page shows (server-only)

export interface BotStatus {
  configured: boolean;
  username: string;
  error: string;
  webhookOk: boolean;
  webhookError: string;
  pendingUpdates: number;
  admins: BotAdmin[];
  channel: string;
  channelTitle: string;
  emojiPack: string;
  emojiCount: number;
}

export async function getBotStatus(): Promise<BotStatus> {
  const config = await getBotConfig();
  const status: BotStatus = {
    configured: isBotConfigured(),
    username: "",
    error: "",
    webhookOk: false,
    webhookError: "",
    pendingUpdates: 0,
    admins: config.admins,
    channel: config.channel,
    channelTitle: "",
    emojiPack: config.emojiPack,
    emojiCount: new Set(Object.values(config.emoji)).size,
  };
  if (!status.configured) return status;

  try {
    const [me, hook] = await Promise.all([
      tg<{ username: string }>("getMe"),
      tg<{ url: string; pending_update_count: number; last_error_message?: string; last_error_date?: number }>("getWebhookInfo"),
    ]);
    status.username = me.username;
    status.webhookOk = hook.url === `${SITE_URL}/api/telegram`;
    status.pendingUpdates = hook.pending_update_count;
    // Only recent errors (last hour) are worth showing
    if (hook.last_error_message && (hook.last_error_date ?? 0) * 1000 > Date.now() - 3600_000) {
      status.webhookError = hook.last_error_message;
    }
    if (config.channel) {
      const chat = await tg<{ title?: string }>("getChat", { chat_id: config.channel }).catch(() => null);
      status.channelTitle = chat?.title ?? "";
    }
  } catch (error) {
    status.error = error instanceof Error ? error.message : String(error);
  }
  return status;
}

