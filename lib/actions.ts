"use server";

import { contactSchema, normalizeUzPhone } from "@/lib/validation";
import { notifyTelegram } from "@/lib/telegram";

// Contact form handler: saves the lead to Firestore (admin panel → Arizalar)
// and notifies the Telegram chat. Succeeds if at least one of them worked.
// Firebase is imported lazily so a Firebase failure can never block Telegram.

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
}) {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const lead = { ...parsed.data, tel: normalizeUzPhone(parsed.data.tel) ?? parsed.data.tel };
  const [saved, sent] = await Promise.all([saveLead(lead), sendTelegram(lead)]);

  if (!saved && !sent) {
    return { success: false, error: "Failed to send message" };
  }
  return { success: true };
}
