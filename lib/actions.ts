"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { contactSchema, normalizeUzPhone } from "@/lib/validation";
import { notifyTelegram } from "@/lib/telegram";

// Contact form handler: saves the lead to Firestore (admin panel → Arizalar)
// and notifies the Telegram chat. Succeeds if at least one of them worked.
// Firebase is imported lazily so a Firebase failure can never block Telegram.

// Anti-spam: the same phone at most once per 2 minutes, one IP at most
// 5 leads per hour (counters in Firestore "rateLimits"; skipped if Firestore is down)
const PHONE_GAP_MS = 2 * 60 * 1000;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_MAX = 5;

async function rateLimited(tel: string): Promise<"errTooFast" | "errTooMany" | null> {
  try {
    const { adminDb, isFirebaseConfigured } = await import("@/lib/firebase/admin");
    if (!isFirebaseConfigured()) return null;
    const db = adminDb();
    const ip = headers().get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const ipKey = createHash("sha256").update(ip).digest("hex").slice(0, 24); // no raw IPs stored
    const phoneRef = db.collection("rateLimits").doc(`tel_${tel.replace(/\D/g, "")}`);
    const ipRef = db.collection("rateLimits").doc(`ip_${ipKey}`);
    return await db.runTransaction(async (tx) => {
      const [phone, ipDoc] = await Promise.all([tx.get(phoneRef), tx.get(ipRef)]);
      const now = Date.now();
      if (now - Number(phone.get("lastAt") ?? 0) < PHONE_GAP_MS) return "errTooFast";
      const fresh = now - Number(ipDoc.get("windowStart") ?? 0) > IP_WINDOW_MS;
      const count = fresh ? 0 : Number(ipDoc.get("count") ?? 0);
      if (count >= IP_MAX) return "errTooMany";
      tx.set(phoneRef, { lastAt: now });
      tx.set(ipRef, { windowStart: fresh ? now : Number(ipDoc.get("windowStart")), count: count + 1 });
      return null;
    });
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return null;
  }
}

async function saveLead(values: { name: string; tel: string; kurs: string }) {
  try {
    const { adminDb, isFirebaseConfigured } = await import("@/lib/firebase/admin");
    if (!isFirebaseConfigured()) return false;
    const { FieldValue } = await import("firebase-admin/firestore");
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

function sendTelegram(values: { name: string; tel: string; kurs: string }) {
  return notifyTelegram(`Ism: ${values.name}:\nTelefon nomeri: ${values.tel}:\nKurs nomi: ${values.kurs}`);
}

export async function sendContactMessage(values: {
  name: string;
  tel: string;
  kurs: string;
  // Hidden field people never see; bots fill it in
  website?: string;
}) {
  if (values?.website) return { success: true }; // a bot: drop it quietly

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const lead = { ...parsed.data, tel: normalizeUzPhone(parsed.data.tel) ?? parsed.data.tel };
  const limited = await rateLimited(lead.tel);
  if (limited) return { success: false, error: limited };

  const [saved, sent] = await Promise.all([saveLead(lead), sendTelegram(lead)]);

  if (!saved && !sent) {
    return { success: false, error: "Failed to send message" };
  }
  return { success: true };
}
