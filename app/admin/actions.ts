"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { deleteMediaUrl, MediaValidationError, saveMedia } from "@/lib/media";
import { requireAdmin, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth";
import { isAllowedImageUrl } from "@/lib/images";
import { isValidVideoUrl } from "@/lib/video";
import { LeadStatus, ReviewStatus } from "@/types";

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

async function uploadImage(file: File): Promise<string> {
  try {
    return await saveMedia(file);
  } catch (error) {
    if (error instanceof MediaValidationError) throw error;
    console.error("Image upload failed:", error);
    throw new Error("Rasm yuklanmadi. Qaytadan urinib ko'ring.");
  }
}

// Uses the uploaded file if there is one, otherwise the URL field.
async function resolveImage(formData: FormData): Promise<string> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) return uploadImage(file);

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

// Every public page that shows the course list
function revalidateCoursePages() {
  for (const path of ["/", "/about", "/contact", "/admin/courses"]) revalidatePath(path);
}

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
      image: await resolveImage(formData),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const col = adminDb().collection("courses");
    if (id) {
      const oldImage = (await col.doc(id).get()).get("image");
      await col.doc(id).update(data);
      if (oldImage !== data.image) await deleteMediaUrl(oldImage);
    }
    else await col.add({ ...data, createdAt: FieldValue.serverTimestamp() });

    revalidateCoursePages();
  });
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const ref = adminDb().collection("courses").doc(id);
    const oldImage = (await ref.get()).get("image");
    await ref.delete();
    await deleteMediaUrl(oldImage);
    revalidateCoursePages();
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
      image: await resolveImage(formData),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const col = adminDb().collection("news");
    if (id) {
      const oldImage = (await col.doc(id).get()).get("image");
      await col.doc(id).update(data);
      if (oldImage !== data.image) await deleteMediaUrl(oldImage);
    }
    else await col.add({ ...data, createdAt: FieldValue.serverTimestamp() });

    revalidatePath("/news");
    revalidatePath("/admin/news");
  });
}

export async function deleteNews(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const ref = adminDb().collection("news").doc(id);
    const oldImage = (await ref.get()).get("image");
    await ref.delete();
    await deleteMediaUrl(oldImage);
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

// ---------- Site settings ----------

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();

    const studentCount = Number(str(formData, "studentCount").replace(/\D/g, ""));
    if (!Number.isInteger(studentCount) || studentCount <= 0 || studentCount > 10_000_000) {
      throw new Error("O'quvchilar sonini to'g'ri kiriting");
    }

    const aboutVideoUrl = str(formData, "aboutVideoUrl");
    if (!isValidVideoUrl(aboutVideoUrl)) {
      throw new Error("Video havolasi https:// bilan boshlanishi kerak");
    }

    // Video card background: uploaded file or URL (empty = default image)
    const aboutVideoImage = await resolveImage(formData);

    const settingsRef = adminDb().collection("settings").doc("site");
    const oldImage = (await settingsRef.get()).get("aboutVideoImage");
    await settingsRef.set(
      { studentCount, aboutVideoUrl, aboutVideoImage, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    if (oldImage !== aboutVideoImage) await deleteMediaUrl(oldImage);

    for (const path of ["/about", "/news", "/admin/settings"]) revalidatePath(path);
  });
}

// ---------- Reviews ----------

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    if (!["pending", "approved", "hidden"].includes(status)) throw new Error("Noto'g'ri holat");
    await adminDb().collection("reviews").doc(id).update({ status });
    for (const path of ["/", "/admin/reviews", "/admin"]) revalidatePath(path);
  });
}

export async function deleteReview(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await adminDb().collection("reviews").doc(id).delete();
    for (const path of ["/", "/admin/reviews", "/admin"]) revalidatePath(path);
  });
}
