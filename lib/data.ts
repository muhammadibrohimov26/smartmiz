import { promises as fs } from "fs";
import path from "path";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { Lead, NewsItem, Price } from "@/types";

// Data access for courses, results (news) and leads.
// Without Firebase env vars the public pages read the bundled JSON files.

async function readPublicJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(process.cwd(), "public", file), "utf8");
  return JSON.parse(raw) as T;
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return typeof value === "string" ? value : "";
}

export async function getCourses(): Promise<Price[]> {
  if (!isFirebaseConfigured()) return readPublicJson<Price[]>("db.json");

  const snap = await adminDb().collection("courses").orderBy("createdAt", "asc").get();
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
}

export async function getNews(): Promise<NewsItem[]> {
  if (!isFirebaseConfigured()) return readPublicJson<NewsItem[]>("news.json");

  const snap = await adminDb().collection("news").orderBy("date", "desc").get();
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
}

export async function getLeads(): Promise<Lead[]> {
  const snap = await adminDb().collection("leads").orderBy("createdAt", "desc").get();
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
