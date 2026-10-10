import { Lead, NewsItem, Price } from "@/types";
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
