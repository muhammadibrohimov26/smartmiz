import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// Uploaded images live in Firestore ("media" collection) instead of Firebase
// Storage, which needs the paid Blaze plan. The admin panel shrinks images in
// the browser first; a Firestore document is limited to 1 MiB.
// Served by app/media/[id]/route.ts at /media/<id>. Server-only module.

export const MEDIA_MAX_BYTES = 900 * 1024;
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png", "image/gif"];

// A problem with the file itself; the message is safe to show to the admin
export class MediaValidationError extends Error {}

export async function saveMedia(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) throw new MediaValidationError("Faqat JPG, PNG, WebP yoki GIF rasm yuklash mumkin");
  if (file.size > MEDIA_MAX_BYTES) throw new MediaValidationError("Rasm juda katta (900 KB dan oshmasin)");

  const id = randomUUID();
  await adminDb().collection("media").doc(id).set({
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
    size: file.size,
    createdAt: FieldValue.serverTimestamp(),
  });
  return `/media/${id}`;
}

const MEDIA_URL_RE = /^\/media\/([0-9a-f-]{36})$/;

// Removes an uploaded image once nothing uses it (old course/result picture).
export async function deleteMediaUrl(url: unknown) {
  const id = typeof url === "string" ? url.match(MEDIA_URL_RE)?.[1] : undefined;
  if (!id) return;
  try {
    await adminDb().collection("media").doc(id).delete();
  } catch (error) {
    console.error("Failed to delete media", id, error);
  }
}
