import { Lead, NewsItem, Price, Review, ReviewStatus, SiteSettings } from "@/types";
import { DEFAULT_ABOUT_VIDEO_IMAGE, DEFAULT_ABOUT_VIDEO_URL, isValidVideoUrl } from "@/lib/video";
import { isAllowedImageUrl } from "@/lib/images";
// Bundled into the server code, so the fallback also works in serverless functions
import localCourses from "@/public/db.json";
import localNews from "@/public/news.json";

// Data access for courses, results (news) and leads.
// Firebase is loaded lazily: if it is not configured, or fails at runtime,
// public pages fall back to the bundled JSON files instead of crashing.
// Admin pages pass { strict: true } so they never show (and edit) stale fallback data.

type Options = { strict?: boolean };

async function firestore() {
  const { adminDb, isFirebaseConfigured } = await import("@/lib/firebase/admin");
  return isFirebaseConfigured() ? adminDb() : null;
}

async function withFallback<T>(read: () => Promise<T | null>, fallback: T, { strict }: Options) {
  try {
    const result = await read();
    if (result !== null) return result;
    if (strict) throw new Error("Firebase Admin is not configured");
  } catch (error) {
    if (strict) throw error;
    console.error("Firestore read failed, using bundled JSON:", error);
  }
  return fallback;
}

export async function getCourses(options: Options = {}): Promise<Price[]> {
  return withFallback<Price[]>(async () => {
    const db = await firestore();
    if (!db) return null;
    const snap = await db.collection("courses").orderBy("createdAt", "asc").get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        courseName: d.courseName ?? "",
        coursePrice: Number(d.coursePrice ?? 0),
        courseChegirma: Number(d.courseChegirma ?? 0),
        courseTime: d.courseTime ?? "",
        courseType: d.courseType ?? "",
        chegirma: d.chegirma ?? "",
        image: d.image ?? "",
      };
    });
  }, localCourses as Price[], options);
}

export async function getNews(options: Options = {}): Promise<NewsItem[]> {
  return withFallback<NewsItem[]>(async () => {
    const db = await firestore();
    if (!db) return null;
    const snap = await db.collection("news").orderBy("date", "desc").get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? "",
        course: d.course ?? "",
        result: d.result ?? "",
        score: d.score ?? "",
        image: d.image ?? "",
        date: d.date ?? "",
        quote: d.quote ?? "",
      };
    });
  }, localNews as NewsItem[], options);
}

export async function getLeads(): Promise<Lead[]> {
  const db = await firestore();
  if (!db) throw new Error("Firebase Admin is not configured");
  const { Timestamp } = await import("firebase-admin/firestore");
  const toIso = (value: unknown) =>
    value instanceof Timestamp ? value.toDate().toISOString() : typeof value === "string" ? value : "";

  const snap = await db.collection("leads").orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name ?? "",
      tel: d.tel ?? "",
      kurs: d.kurs ?? "",
      status: d.status === "contacted" ? "contacted" : "new",
      createdAt: toIso(d.createdAt),
    };
  });
}

// ---------- Site settings (admin panel → Sozlamalar) ----------

export const DEFAULT_STUDENT_COUNT = 18000;

export async function getSiteSettings(options: Options = {}): Promise<SiteSettings> {
  return withFallback<SiteSettings>(async () => {
    const db = await firestore();
    if (!db) return null;
    const doc = await db.collection("settings").doc("site").get();
    const count = Number(doc.get("studentCount"));
    const video = String(doc.get("aboutVideoUrl") ?? "");
    const image = String(doc.get("aboutVideoImage") ?? "");
    return {
      studentCount: Number.isFinite(count) && count > 0 ? count : DEFAULT_STUDENT_COUNT,
      aboutVideoUrl: isValidVideoUrl(video) ? video : DEFAULT_ABOUT_VIDEO_URL,
      aboutVideoImage: image && isAllowedImageUrl(image) ? image : DEFAULT_ABOUT_VIDEO_IMAGE,
    };
  }, {
    studentCount: DEFAULT_STUDENT_COUNT,
    aboutVideoUrl: DEFAULT_ABOUT_VIDEO_URL,
    aboutVideoImage: DEFAULT_ABOUT_VIDEO_IMAGE,
  }, options);
}

// ---------- Reviews (customers sign in with Google; admin approves) ----------

const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved", "hidden"];

async function readReviews(onlyApproved: boolean): Promise<Review[]> {
  const db = await firestore();
  if (!db) return [];
  const { Timestamp } = await import("firebase-admin/firestore");
  const col = db.collection("reviews");
  // Filter only (no orderBy) so Firestore needs no composite index; sort here
  const snap = await (onlyApproved ? col.where("status", "==", "approved") : col).get();
  return snap.docs
    .map((doc) => {
      const d = doc.data();
      const updated = d.updatedAt instanceof Timestamp ? d.updatedAt.toDate().toISOString() : "";
      return {
        id: doc.id,
        name: String(d.name ?? ""),
        photo: String(d.photo ?? ""),
        rating: Math.min(5, Math.max(1, Number(d.rating) || 5)),
        text: String(d.text ?? ""),
        status: REVIEW_STATUSES.includes(d.status) ? (d.status as ReviewStatus) : "pending",
        updatedAt: updated,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getApprovedReviews(): Promise<Review[]> {
  return withFallback<Review[]>(() => readReviews(true), [], {});
}

export async function getAllReviews(): Promise<Review[]> {
  return readReviews(false);
}

// ---------- Admin dashboard counts (aggregation queries: no documents downloaded) ----------

export async function getAdminCounts() {
  const db = await firestore();
  if (!db) throw new Error("Firebase Admin is not configured");
  const count = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;
  const [newLeads, pendingReviews, courses, news] = await Promise.all([
    count(db.collection("leads").where("status", "==", "new")),
    count(db.collection("reviews").where("status", "==", "pending")),
    count(db.collection("courses")),
    count(db.collection("news")),
  ]);
  return { newLeads, pendingReviews, courses, news };
}
