"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminBucket, adminDb } from "@/lib/firebase/admin";
import { requireAdmin, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth";
import { isAllowedImageUrl } from "@/lib/images";
import { LeadStatus } from "@/types";

type ActionResult = { success: true } | { success: false; error: string };

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    return { success: true };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return { success: false, error: message };
  }
}

// ---------- Auth ----------

export async function login(idToken: string): Promise<ActionResult> {
  return run(async () => {
    const decoded = await adminAuth().verifyIdToken(idToken, true);
    if (decoded.admin !== true) throw new Error("Bu foydalanuvchi admin emas");

    const session = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });
    cookies().set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
  });
}

export async function logout() {
  const session = cookies().get(SESSION_COOKIE)?.value;
  cookies().delete(SESSION_COOKIE);
  if (session) {
    try {
      const decoded = await adminAuth().verifySessionCookie(session);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // cookie already invalid — nothing to revoke
    }
  }
}

// ---------- Images ----------

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm yuklash mumkin");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Rasm hajmi 4MB dan oshmasin");

  const bucket = adminBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${folder}/${randomUUID()}.${ext}`;
  const token = randomUUID();

  await bucket.file(filePath).save(Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

// Uses the uploaded file if there is one, otherwise the URL field.
async function resolveImage(formData: FormData, folder: string): Promise<string> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) return uploadImage(file, folder);

  const url = String(formData.get("image") ?? "").trim();
  if (!isAllowedImageUrl(url)) {
    throw new Error("Bu manzildagi rasmni ishlatib bo'lmaydi — rasmni fayl sifatida yuklang");
  }
  return url;
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

// ---------- Courses ----------

export async function saveCourse(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();

    const id = str(formData, "id");
    const courseName = str(formData, "courseName");
    if (!courseName) throw new Error("Kurs nomi kiritilmagan");

    const data = {
      courseName,
      courseType: str(formData, "courseType"),
      coursePrice: Number(str(formData, "coursePrice")) || 0,
      courseChegirma: Number(str(formData, "courseChegirma")) || 0,
      courseTime: str(formData, "courseTime"),
      chegirma: str(formData, "chegirma"),
      image: await resolveImage(formData, "courses"),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const col = adminDb().collection("courses");
    if (id) await col.doc(id).update(data);
    else await col.add({ ...data, createdAt: FieldValue.serverTimestamp() });

    revalidatePath("/");
    revalidatePath("/admin/courses");
  });
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await adminDb().collection("courses").doc(id).delete();
    revalidatePath("/");
    revalidatePath("/admin/courses");
  });
}

// ---------- Results (news) ----------

export async function saveNews(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();

    const id = str(formData, "id");
    const name = str(formData, "name");
    if (!name) throw new Error("O'quvchi ismi kiritilmagan");

    const data = {
      name,
      course: str(formData, "course"),
      score: str(formData, "score"),
      result: str(formData, "result"),
      quote: str(formData, "quote"),
      date: str(formData, "date"),
      image: await resolveImage(formData, "news"),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const col = adminDb().collection("news");
    if (id) await col.doc(id).update(data);
    else await col.add({ ...data, createdAt: FieldValue.serverTimestamp() });

    revalidatePath("/news");
    revalidatePath("/admin/news");
  });
}

export async function deleteNews(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await adminDb().collection("news").doc(id).delete();
    revalidatePath("/news");
    revalidatePath("/admin/news");
  });
}

// ---------- Leads ----------

export async function setLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await adminDb().collection("leads").doc(id).update({ status });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
  });
}

export async function deleteLead(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await adminDb().collection("leads").doc(id).delete();
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
  });
}
