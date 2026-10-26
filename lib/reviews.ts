"use server";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { notifyTelegram } from "@/lib/telegram";
import { getCourses } from "@/lib/data";
import { courseLabel, courseSlug } from "@/lib/courses";
import { Review, ReviewStatus } from "@/types";

// Customer reviews. The browser sends the customer's Firebase ID token (Google
// sign-in); it is verified here, so a review is always tied to a real account.
// One review of the centre per account (doc id = uid) and one rating per course
// per account (doc id = uid__<course slug>). New or edited ones wait for approval.

type Result = { success: true } | { success: false; error: string };

const MIN_TEXT = 10;
const MAX_TEXT = 1000;
const EDIT_COOLDOWN_MS = 60_000;

async function verifyCustomer(idToken: string) {
  if (!idToken) throw new Error("errReviewLogin");
  try {
    return await adminAuth().verifyIdToken(idToken);
  } catch {
    throw new Error("errReviewLogin");
  }
}

// The course a slug belongs to (only courses that exist can be rated)
async function courseFor(slug: string) {
  const course = (await getCourses()).find((c) => courseSlug(c) === slug);
  if (!course) throw new Error("errorMsg");
  return course;
}

const docId = (uid: string, slug?: string) => (slug ? `${uid}__${slug}` : uid);

export async function getMyReview(idToken: string, slug?: string): Promise<Pick<Review, "rating" | "text" | "status"> | null> {
  try {
    const user = await verifyCustomer(idToken);
    const doc = await adminDb().collection("reviews").doc(docId(user.uid, slug)).get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return { rating: Number(d.rating) || 5, text: String(d.text ?? ""), status: (d.status as ReviewStatus) ?? "pending" };
  } catch (error) {
    console.error("getMyReview failed:", error);
    return null;
  }
}

// slug: rate that course (course page); without it: review of the centre (home page)
export async function submitReview(idToken: string, rating: number, text: string, slug?: string): Promise<Result> {
  try {
    const user = await verifyCustomer(idToken);

    const cleanText = String(text ?? "").trim();
    const stars = Math.round(Number(rating));
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error("errReviewRating");
    if (cleanText.length > MAX_TEXT) throw new Error("errReviewText");
    // A 5-star rating may come without a comment; a lower one needs the reason
    if (stars < 5 && cleanText.length < MIN_TEXT) throw new Error("errReviewTextLow");
    const course = slug ? await courseFor(slug) : null;

    const ref = adminDb().collection("reviews").doc(docId(user.uid, slug));
    const existing = await ref.get();
    const last = existing.get("updatedAt");
    if (last instanceof Timestamp && Date.now() - last.toMillis() < EDIT_COOLDOWN_MS) {
      throw new Error("errReviewTooFast");
    }

    const name = user.name || user.email?.split("@")[0] || "Oʻquvchi";
    await ref.set(
      {
        name,
        email: user.email ?? "",
        photo: user.picture ?? "",
        rating: stars,
        text: cleanText,
        status: "pending",
        ...(course ? { courseSlug: slug, courseLabel: courseLabel(course) } : {}),
        updatedAt: FieldValue.serverTimestamp(),
        ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true }
    );

    const what = course ? `«${courseLabel(course)}» kursiga baho` : "sharh";
    await notifyTelegram(
      `${existing.exists ? `Tahrirlangan ${what}` : `Yangi ${what}`} (tasdiqlash kerak):\n${name} — ${"★".repeat(stars)}\n${cleanText}`
    );
    return { success: true };
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith("errReview") ? error.message : "errorMsg";
    if (message === "errorMsg") console.error("submitReview failed:", error);
    return { success: false, error: message };
  }
}
