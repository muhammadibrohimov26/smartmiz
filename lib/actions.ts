"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { contactSchema } from "@/lib/validation";

// Contact form handler: saves the lead to Firestore (admin panel → Arizalar)
// and notifies the Telegram chat. Succeeds if at least one of them worked.

async function saveLead(values: { name: string; tel: string; kurs: string }) {
  if (!isFirebaseConfigured()) return false;
  try {
    await adminDb().collection("leads").add({
      ...values,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Failed to save lead:", error);
    return false;
  }
}

async function sendTelegram(values: { name: string; tel: string; kurs: string }) {
  const telegramBotId = process.env.TELEGRAM_BOT_API;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotId || !telegramChatId) {
    console.error("Missing Telegram bot credentials");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotId}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `Ism: ${values.name}:\nTelefon nomeri: ${values.tel}:\nKurs nomi: ${values.kurs}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Failed to send telegram message:", error);
    return false;
  }
}

export async function sendContactMessage(values: {
  name: string;
  tel: string;
  kurs: string;
}) {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const [saved, sent] = await Promise.all([
    saveLead(parsed.data),
    sendTelegram(parsed.data),
  ]);

  if (!saved && !sent) {
    return { success: false, error: "Failed to send message" };
  }
  return { success: true };
}
