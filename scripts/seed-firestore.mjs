// Copies public/db.json (courses) and public/news.json (results) into Firestore.
// Collections that already have documents are skipped unless --force is passed.
// Usage: npm run seed  (or: npm run seed -- --force)
import { readFile } from "fs/promises";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initAdmin } from "./firebase-admin.mjs";

const db = getFirestore(initAdmin());
const force = process.argv.includes("--force");

async function readJson(file) {
  return JSON.parse(await readFile(new URL(`../public/${file}`, import.meta.url), "utf8"));
}

async function seed(collection, items, toDoc) {
  const existing = await db.collection(collection).limit(1).get();
  if (!existing.empty && !force) {
    console.log(`${collection}: allaqachon ma'lumot bor, o'tkazib yuborildi (--force bilan qayta yozish mumkin)`);
    return;
  }
  const batch = db.batch();
  const start = Date.now();
  items.forEach((item, i) => {
    const { id, data } = toDoc(item);
    // createdAt keeps the original JSON order
    batch.set(db.collection(collection).doc(id), {
      ...data,
      createdAt: Timestamp.fromMillis(start + i),
    });
  });
  await batch.commit();
  console.log(`${collection}: ${items.length} ta yozildi`);
}

await seed("courses", await readJson("db.json"), (c) => ({
  id: c._id,
  data: {
    courseName: c.courseName,
    courseType: c.courseType,
    coursePrice: Number(c.coursePrice),
    courseChegirma: Number(c.courseChegirma),
    courseTime: String(c.courseTime),
    chegirma: c.chegirma ?? "",
    image: c.image ?? "",
  },
}));

await seed("news", await readJson("news.json"), (n) => ({
  id: n.id,
  data: {
    name: n.name,
    course: n.course,
    result: n.result,
    score: n.score,
    image: n.image ?? "",
    date: n.date,
    quote: n.quote,
  },
}));
