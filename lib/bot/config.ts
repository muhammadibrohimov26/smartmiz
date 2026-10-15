import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// Bot settings, edited in the admin panel (Telegram bot page): Firestore
// settings/bot. Admins are Telegram users who opened a one-time link from the
// admin panel; only they get approval messages and may press the buttons.

export interface BotAdmin {
  id: number;
  name: string;
}

export interface BotConfig {
  admins: BotAdmin[];
  channel: string; // "@smartmiz_uz" or "-100…"
  emoji: Record<string, string>; // "🏆" → custom_emoji_id (premium emoji)
  emojiPack: string;
}

const ref = () => adminDb().collection("settings").doc("bot");

export async function getBotConfig(): Promise<BotConfig> {
  const d = (await ref().get()).data() ?? {};
  return {
    admins: Array.isArray(d.admins) ? d.admins.filter((a: BotAdmin) => Number.isInteger(a?.id)) : [],
    channel: typeof d.channel === "string" ? d.channel : "",
    emoji: d.emoji && typeof d.emoji === "object" ? d.emoji : {},
    emojiPack: typeof d.emojiPack === "string" ? d.emojiPack : "",
  };
}

export async function updateBotConfig(data: Partial<Omit<BotConfig, "admins">>) {
  await ref().set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ---------- Linking a Telegram account as bot admin ----------

const LINK_TTL_MS = 15 * 60 * 1000;

// One-time code for t.me/<bot>?start=admin_<code> (valid 15 minutes)
export async function createAdminLinkCode() {
  const code = randomBytes(12).toString("hex");
  await ref().set({ adminCode: code, adminCodeExpires: Date.now() + LINK_TTL_MS }, { merge: true });
  return code;
}

// Called by the webhook on "/start admin_<code>"; true when the code was valid
export async function claimAdminLink(code: string, admin: BotAdmin) {
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref());
    const d = snap.data() ?? {};
    if (!code || d.adminCode !== code || !(Number(d.adminCodeExpires) > Date.now())) return false;
    const admins: BotAdmin[] = (Array.isArray(d.admins) ? d.admins : []).filter((a: BotAdmin) => a.id !== admin.id);
    tx.set(ref(), { admins: [...admins, admin], adminCode: FieldValue.delete(), adminCodeExpires: FieldValue.delete() }, { merge: true });
    return true;
  });
}

export async function removeBotAdmin(id: number) {
  const { admins } = await getBotConfig();
  await ref().set({ admins: admins.filter((a) => a.id !== id) }, { merge: true });
}
