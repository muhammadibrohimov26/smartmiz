import { Price } from "@/types";

type CourseRef = Pick<Price, "courseName" | "courseType">;

// courseType values that only name the category (e.g. "Ingliz tili" / "General"),
// not a separate course like "Ingliz tili" / "IELTS".
const CATEGORY_TYPES = new Set(["IT", "General", "Kompyuter"]);

export function courseSpecialization({ courseName, courseType }: CourseRef) {
  const type = courseType?.trim();
  return type && type !== courseName && !CATEGORY_TYPES.has(type) ? type : "";
}

// Canonical Uzbek label, e.g. "Ingliz tili — IELTS". Used as the contact-form
// value, so it is what arrives in Telegram and the admin panel's leads.
export function courseLabel(course: CourseRef) {
  const spec = courseSpecialization(course);
  return spec ? `${course.courseName} — ${spec}` : course.courseName;
}

// Same label translated for display.
export function translatedCourseLabel(course: CourseRef, t: (key: string) => string) {
  const spec = courseSpecialization(course);
  return spec ? `${t(course.courseName)} — ${t(spec)}` : t(course.courseName);
}

// Unique courses by label, keeping the original order.
export function uniqueCourses<T extends CourseRef>(courses: T[]) {
  const seen = new Set<string>();
  return courses.filter((c) => {
    const label = courseLabel(c);
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

// "1.5" → "1,5" for locales that use a decimal comma.
// (Not Intl: browsers' ICU data formats "uz" with a decimal point.)
const DECIMAL_COMMA_LOCALES = new Set(["uz", "ru", "tr"]);

export function formatHours(value: string, locale: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  const text = String(n);
  return DECIMAL_COMMA_LOCALES.has(locale) ? text.replace(".", ",") : text;
}
