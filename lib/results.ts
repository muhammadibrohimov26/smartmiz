import { NewsItem } from "@/types";

// Reads level, score and language out of a result as it is typed in the admin
// panel ("Ingliz tili — CEFR B2" / "52", "TOPIK II — 4-daraja" / "168",
// "IELTS" / "7.5"), to order the results page and group its filters.

type Result = Pick<NewsItem, "course" | "result" | "score">;

// Language groups of the filter, by what the exam/course text mentions
const LANGUAGES: [RegExp, string][] = [
  [/koreys|korean|topik/i, "Koreys tili"],
  [/turk/i, "Turk tili"],
  [/ingliz|english|ielts/i, "Ingliz tili"],
  [/\brus\b|rus tili|russian|trki/i, "Rus tili"],
  [/arab/i, "Arab tili"],
];

export function resultLanguage(item: Result) {
  const text = `${item.course} ${item.result}`;
  return LANGUAGES.find(([re]) => re.test(text))?.[1] ?? "";
}

const CEFR: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

function scoreNumber(score: string) {
  const n = parseFloat(score.replace(",", "."));
  return Number.isFinite(n) ? n : -1;
}

// level: 1 (A1) … 6 (C2) on one scale for all exams (TOPIK levels 1–6 and
// IELTS bands mapped to their usual CEFR equivalents); 0 = unknown.
// percent: the score as a share of the exam's maximum, so scores of
// different exams at the same level can be compared.
export function resultLevel(item: Result) {
  const text = `${item.course} ${item.result}`;
  const score = scoreNumber(item.score);
  const outOf = Number(text.match(/\/\s*(\d{2,3})/)?.[1]); // "(168/300 ball)"

  if (/topik/i.test(text)) {
    const level = Number(text.match(/(\d)\s*[-–]?\s*(?:daraja|급|level)/i)?.[1] ?? 0);
    const max = outOf || (/topik\s*ii/i.test(text) ? 300 : 200);
    return { level, label: level ? `TOPIK ${level}` : "TOPIK", percent: score >= 0 ? score / max : -1 };
  }
  const cefr = text.match(/\b([ABC][12])\b/i)?.[1].toUpperCase();
  if (cefr) {
    return { level: CEFR[cefr], label: `CEFR ${cefr}`, percent: score >= 0 ? score / (outOf || 75) : -1 };
  }
  if (/ielts/i.test(text) && score >= 0) {
    const level = score >= 8.5 ? 6 : score >= 7 ? 5 : score >= 5.5 ? 4 : score >= 4 ? 3 : 2;
    return { level, label: "IELTS", percent: score / 9 };
  }
  return { level: 0, label: "", percent: score >= 0 && outOf ? score / outOf : -1 };
}

// Pinned ("Tartib raqami") first, by that number; then higher level, higher
// score, newer date.
export function compareResults(a: NewsItem, b: NewsItem) {
  const pa = a.order ?? Infinity;
  const pb = b.order ?? Infinity;
  if (pa !== pb) return pa - pb;
  const la = resultLevel(a);
  const lb = resultLevel(b);
  if (la.level !== lb.level) return lb.level - la.level;
  if (la.percent !== lb.percent) return lb.percent - la.percent;
  return (b.date || "").localeCompare(a.date || "");
}
