import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CourseRating, Lead, NewsItem, Price, Review, ReviewStatus, SiteSettings, TelegramMediaKind } from "@/types";
import { DEFAULT_ABOUT_VIDEO_IMAGE, DEFAULT_ABOUT_VIDEO_URL, isValidVideoUrl } from "@/lib/video";
import { isAllowedImageUrl } from "@/lib/images";
import { compareResults } from "@/lib/results";
// Bundled into the server code, so the fallback also works in serverless functions
import localCourses from "@/public/db.json";
import localNews from "@/public/news.json";

// Data access for courses, results (news) and leads.
// Firebase is loaded lazily: if it is not configured, or fails at runtime,
// public pages fall back to the bundled JSON files instead of crashing.
// Admin pages pass { strict: true } so they never show (and edit) stale fallback data.
//
// Caching (Firestore free plan: 50 000 reads/day). Public pages read courses,
// results, reviews and settings through Next's Data Cache: one Firestore read
// per collection every CACHE_SECONDS at most, shared by every page, render and
// server instance — not one per visit, page or ISR re-render. Admin panel and
// bot changes clear it at once with revalidateTag(CACHE_TAGS.x) (see
// revalidateData below), so the time limit is only a safety net.
// Failed reads throw inside the cached function, so a fallback is never cached.
// The admin panel ({ strict: true }) always reads fresh data.

type Options = { strict?: boolean };

async function firestore() {
  const { adminDb, isFirebaseConfigured } = await import("@/lib/firebase/admin");
  return isFirebaseConfigured() ? adminDb() : null;
}

export const CACHE_SECONDS = 600;

export const CACHE_TAGS = {
  courses: "courses",
  news: "news",
  reviews: "reviews",
  settings: "settings",
} as const;

// Cached on the server for CACHE_SECONDS under `tag`; also deduplicated within
// one render (React cache), e.g. a course page's metadata + page body.
function cached<T>(key: string, tag: string, read: () => Promise<T>) {
  return cache(unstable_cache(read, ["data", key], { revalidate: CACHE_SECONDS, tags: [tag] }));
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

async function readCourses(): Promise<Price[] | null> {
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
        description: typeof d.description === "string" ? d.description : "",
        highlights: Array.isArray(d.highlights) ? d.highlights.filter((h: unknown) => typeof h === "string") : [],
      };
    });
}
const cachedCourses = cached("courses", CACHE_TAGS.courses, readCourses);

export async function getCourses(options: Options = {}): Promise<Price[]> {
  return withFallback<Price[]>(options.strict ? readCourses : cachedCourses, localCourses as Price[], options);
}

const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved", "hidden"];
const MEDIA_KINDS: TelegramMediaKind[] = ["video", "video_note", "voice", "audio"];

// Results added in the admin panel have no status (= on the site); results sent
// through the Telegram bot start "pending" until an admin approves them.
// The public site gets approved ones only; { all: true } is for the admin panel.
async function readNews(): Promise<NewsItem[] | null> {
    const db = await firestore();
    if (!db) return null;
    // Filtered here, not in the query: old results have no status field at all
    const snap = await db.collection("news").orderBy("date", "desc").get();
    const items = snap.docs.map((doc): NewsItem => {
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
        status: REVIEW_STATUSES.includes(d.status) ? d.status : "approved",
        order: Number.isInteger(d.order) && d.order > 0 ? d.order : undefined,
        telegramLink: d.telegramLink || undefined,
        media: MEDIA_KINDS.includes(d.media?.kind) ? d.media.kind : undefined,
      };
    });
    // Best results first (lib/results.ts), not just the newest
    return items.sort(compareResults);
}
const cachedNews = cached("news", CACHE_TAGS.news, readNews);

// The whole list (one cached read): /news shows all results and each course
// page picks its own, so a limit() here would hide results there.
export async function getNews(options: Options & { all?: boolean } = {}): Promise<NewsItem[]> {
  return withFallback<NewsItem[]>(async () => {
    const items = await (options.strict ? readNews : cachedNews)();
    if (!items) return null;
    return options.all ? items : items.filter((item) => item.status === "approved");
  }, (localNews as Omit<NewsItem, "status">[]).map((item) => ({ ...item, status: "approved" as const })), options);
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

async function readSiteSettings(): Promise<SiteSettings | null> {
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
}
const cachedSiteSettings = cached("settings", CACHE_TAGS.settings, readSiteSettings);

export async function getSiteSettings(options: Options = {}): Promise<SiteSettings> {
  return withFallback<SiteSettings>(options.strict ? readSiteSettings : cachedSiteSettings, {
    studentCount: DEFAULT_STUDENT_COUNT,
    aboutVideoUrl: DEFAULT_ABOUT_VIDEO_URL,
    aboutVideoImage: DEFAULT_ABOUT_VIDEO_IMAGE,
  }, options);
}

// ---------- Reviews (customers sign in with Google; admin approves) ----------

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
        courseSlug: typeof d.courseSlug === "string" && d.courseSlug ? d.courseSlug : undefined,
        courseLabel: typeof d.courseLabel === "string" && d.courseLabel ? d.courseLabel : undefined,
        name: String(d.name ?? ""),
        photo: String(d.photo ?? ""),
        rating: Math.min(5, Math.max(1, Number(d.rating) || 5)),
        text: String(d.text ?? ""),
        status: REVIEW_STATUSES.includes(d.status) ? (d.status as ReviewStatus) : "pending",
        updatedAt: updated,
        telegramLink: d.telegramLink || undefined,
        media: MEDIA_KINDS.includes(d.media?.kind) ? (d.media.kind as TelegramMediaKind) : undefined,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// Approved reviews for the public pages: one cached read shared by the home
// page (centre reviews + course ratings) and every course page
const cachedApprovedReviews = cached("reviews-approved", CACHE_TAGS.reviews, () => readReviews(true));

// Home page: reviews of the centre (course ratings are on their course pages)
export async function getApprovedReviews(): Promise<Review[]> {
  return withFallback<Review[]>(async () => (await cachedApprovedReviews()).filter((r) => !r.courseSlug), [], {});
}

// One course page's approved ratings
export async function getCourseReviews(slug: string): Promise<Review[]> {
  return withFallback<Review[]>(async () => (await cachedApprovedReviews()).filter((r) => r.courseSlug === slug), [], {});
}

// Average rating per course slug (approved ratings only)
export async function getCourseRatings(): Promise<Record<string, CourseRating>> {
  return withFallback<Record<string, CourseRating>>(async () => {
    const sums: Record<string, { sum: number; count: number }> = {};
    for (const r of await cachedApprovedReviews()) {
      if (!r.courseSlug) continue;
      const o = (sums[r.courseSlug] ??= { sum: 0, count: 0 });
      o.sum += r.rating;
      o.count++;
    }
    return Object.fromEntries(Object.entries(sums).map(([slug, o]) => [slug, { average: o.sum / o.count, count: o.count }]));
  }, {}, {});
}

export async function getAllReviews(): Promise<Review[]> {
  return readReviews(false);
}

// ---------- Admin dashboard counts (aggregation queries: no documents downloaded) ----------

export async function getAdminCounts() {
  const db = await firestore();
  if (!db) throw new Error("Firebase Admin is not configured");
  const count = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;
  const [newLeads, pendingReviews, courses, news, pendingNews] = await Promise.all([
    count(db.collection("leads").where("status", "==", "new")),
    count(db.collection("reviews").where("status", "==", "pending")),
    count(db.collection("courses")),
    count(db.collection("news")),
    count(db.collection("news").where("status", "==", "pending")),
  ]);
  return { newLeads, pendingReviews, courses, news, pendingNews };
}
