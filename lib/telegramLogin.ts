"use server";

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { adminAuth } from "@/lib/firebase/admin";
import { botToken } from "@/lib/bot/api";

// "Telegram bilan kirish" on the site (Telegram Login Widget of the reviews bot).
// Telegram signs the user data with the bot token; when the signature checks
// out, the visitor gets a Firebase account "tg_<telegram id>" (name and photo
// from Telegram) and a custom token to sign in with — after that it works like
// a Google sign-in (reviews, ratings).

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

type Result = { success: true; token: string } | { success: false; error: string };

const MAX_AGE_S = 24 * 60 * 60;

function validSignature(data: TelegramAuthData, token: string) {
  const fields = Object.entries(data)
    .filter(([key, value]) => key !== "hash" && value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secret = createHash("sha256").update(token).digest();
  const expected = createHmac("sha256", secret).update(fields).digest("hex");
  const given = String(data.hash ?? "");
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function telegramSignIn(data: TelegramAuthData): Promise<Result> {
  try {
    const token = botToken();
    if (!token) return { success: false, error: "errLogin" };
    // Only the fields Telegram sends (an attacker could add others to the object)
    const clean: TelegramAuthData = {
      id: Number(data?.id),
      first_name: data?.first_name,
      last_name: data?.last_name,
      username: data?.username,
      photo_url: data?.photo_url,
      auth_date: Number(data?.auth_date),
      hash: String(data?.hash ?? ""),
    };
    if (!Number.isInteger(clean.id) || !validSignature(clean, token)) return { success: false, error: "errLogin" };
    if (Date.now() / 1000 - clean.auth_date > MAX_AGE_S) return { success: false, error: "errLogin" };

    const uid = `tg_${clean.id}`;
    const profile = {
      displayName: [clean.first_name, clean.last_name].filter(Boolean).join(" ").slice(0, 80) || clean.username || "Telegram",
      ...(clean.photo_url?.startsWith("https://") ? { photoURL: clean.photo_url } : {}),
    };
    try {
      await adminAuth().updateUser(uid, profile);
    } catch {
      await adminAuth().createUser({ uid, ...profile });
    }
    return { success: true, token: await adminAuth().createCustomToken(uid, { telegram: true }) };
  } catch (error) {
    console.error("telegramSignIn failed:", error);
    return { success: false, error: "errLogin" };
  }
}
