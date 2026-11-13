import { Locale } from "@/lib/dictionaries";
import { toCyrillic } from "@/lib/translit";

// Card title, a one-line description and the icon of each course on the home
// page course cards, keyed by the course page slug (lib/courses.ts courseSlug).
// Written in Uzbek, Russian and English; Ўзбекча (uzc) is the Uzbek text in
// Cyrillic, and Türkçe / 한국어 / العربية show the English text.
// A course added in the admin panel that is not listed here falls back to its
// translated name and the first sentence of its admin description.

type Texts = { uz: string; ru: string; en: string };
export type CourseIcon =
  | { glyph: string }
  | { icon: "book" | "certificate" | "layers" | "chat" | "graduation" | "briefcase" | "monitor" | "robot" | "brain" };

interface CourseInfo {
  title: Texts;
  summary: Texts;
  icon: CourseIcon;
}

const same = (text: string): Texts => ({ uz: text, ru: text, en: text });

export const COURSE_INFO: Record<string, CourseInfo> = {
  "ingliz-tili": {
    title: same("General English"),
    summary: {
      uz: "Ingliz tilini bosqichma-bosqich oʻrganish uchun umumiy kurs.",
      ru: "Общий курс для поэтапного изучения английского языка.",
      en: "A general course to learn English step by step.",
    },
    icon: { icon: "book" },
  },
  "ingliz-tili-ielts": {
    title: same("IELTS"),
    summary: {
      uz: "IELTS imtihoniga tayyorgarlik koʻrish uchun ixtisoslashgan kurs.",
      ru: "Специализированный курс подготовки к экзамену IELTS.",
      en: "A specialised course to prepare for the IELTS exam.",
    },
    icon: { icon: "certificate" },
  },
  "ingliz-tili-cefr": {
    title: same("CEFR"),
    summary: {
      uz: "CEFR darajalariga mos ravishda ingliz tilini bosqichma-bosqich oʻrganish kursi.",
      ru: "Поэтапное изучение английского языка по уровням CEFR.",
      en: "Step-by-step English course following the CEFR levels.",
    },
    icon: { icon: "layers" },
  },
  "rus-tili": {
    title: { uz: "Rus tili — Umumiy", ru: "Русский язык — общий", en: "Russian — General" },
    summary: {
      uz: "Rus tilini asosiy koʻnikmalar boʻyicha tizimli oʻrganish kursi.",
      ru: "Системный курс русского языка по всем основным навыкам.",
      en: "A structured Russian course covering all the core skills.",
    },
    icon: { glyph: "АЯ" },
  },
  "rus-tili-c1": {
    title: { uz: "Rus tili — C1", ru: "Русский язык — C1", en: "Russian — C1" },
    summary: {
      uz: "Rus tilini yuqori C1 darajada egallash va imtihonga tayyorgarlik.",
      ru: "Русский язык на продвинутом уровне C1 и подготовка к экзамену.",
      en: "Advanced Russian at C1 level, with exam preparation.",
    },
    icon: { icon: "graduation" },
  },
  "rus-tili-sozlashuv": {
    title: { uz: "Rus tili — Soʻzlashuv", ru: "Разговорный русский", en: "Spoken Russian" },
    summary: {
      uz: "Erkin gapirishga yoʻnaltirilgan amaliy soʻzlashuv kursi.",
      ru: "Практический курс разговорного русского для свободного общения.",
      en: "A practical speaking course to talk in Russian with confidence.",
    },
    icon: { icon: "chat" },
  },
  "koreys-tili": {
    title: { uz: "Koreys tili — Umumiy", ru: "Корейский язык — общий", en: "Korean — General" },
    summary: {
      uz: "Koreys tilini alifbodan boshlab tizimli oʻrganish kursi.",
      ru: "Системный курс корейского языка, начиная с алфавита.",
      en: "A structured Korean course, starting from the alphabet.",
    },
    icon: { glyph: "한" },
  },
  "koreys-tili-topic-1-2": {
    title: same("TOPIK 1, 2"),
    summary: {
      uz: "TOPIK I va II imtihonlariga bosqichma-bosqich tayyorgarlik kursi.",
      ru: "Поэтапная подготовка к экзаменам TOPIK I и II.",
      en: "Step-by-step preparation for the TOPIK I and II exams.",
    },
    icon: { icon: "certificate" },
  },
  "koreys-tili-eps": {
    title: same("EPS-TOPIK"),
    summary: {
      uz: "Koreyada ishlash uchun EPS-TOPIK imtihoniga tayyorgarlik kursi.",
      ru: "Подготовка к экзамену EPS-TOPIK для работы в Корее.",
      en: "Preparation for the EPS-TOPIK exam to work in Korea.",
    },
    icon: { icon: "briefcase" },
  },
  "arab-tili": {
    title: { uz: "Arab tili", ru: "Арабский язык", en: "Arabic" },
    summary: {
      uz: "Arab tilida oʻqish, yozish va soʻzlashishni oʻrganish kursi.",
      ru: "Курс арабского языка: чтение, письмо и разговорная речь.",
      en: "Learn to read, write and speak Arabic.",
    },
    icon: { glyph: "ع" },
  },
  "turk-tili": {
    title: { uz: "Turk tili", ru: "Турецкий язык", en: "Turkish" },
    summary: {
      uz: "Turk tilida erkin muloqot qilishni oʻrgatadigan amaliy kurs.",
      ru: "Практический курс турецкого языка для свободного общения.",
      en: "A practical course to communicate freely in Turkish.",
    },
    icon: { glyph: "Ğ" },
  },
  "kompyuter-kursi": {
    title: { uz: "Kompyuter kursi", ru: "Компьютерный курс", en: "Computer course" },
    summary: {
      uz: "Kompyuterda ishlash koʻnikmalarini noldan oʻrgatadigan amaliy kurs.",
      ru: "Практический курс компьютерной грамотности с нуля.",
      en: "A hands-on computer skills course for beginners.",
    },
    icon: { icon: "monitor" },
  },
  robototexnika: {
    title: { uz: "Robototexnika", ru: "Робототехника", en: "Robotics" },
    summary: {
      uz: "Robot yigʻish va dasturlash asoslarini amalda oʻrganish kursi.",
      ru: "Основы сборки и программирования роботов на практике.",
      en: "Learn the basics of building and programming robots, hands-on.",
    },
    icon: { icon: "robot" },
  },
  "mental-arifmetika": {
    title: { uz: "Mental arifmetika", ru: "Ментальная арифметика", en: "Mental arithmetic" },
    summary: {
      uz: "Tez hisoblash, diqqat va xotirani rivojlantiruvchi kurs.",
      ru: "Курс для развития быстрого счёта, внимания и памяти.",
      en: "Builds fast mental math, focus and memory.",
    },
    icon: { icon: "brain" },
  },
};

// Per-subject icon for courses not listed above
const SUBJECT_ICONS: Record<string, CourseIcon> = {
  "Ingliz tili": { icon: "book" },
  "Rus tili": { glyph: "АЯ" },
  "Koreys tili": { glyph: "한" },
  "Arab tili": { glyph: "ع" },
  "Turk tili": { glyph: "Ğ" },
  "Kompyuter kursi": { icon: "monitor" },
  Robototexnika: { icon: "robot" },
  "Mental arifmetika": { icon: "brain" },
};

export function pickText(texts: Texts, locale: Locale) {
  if (locale === "uz" || locale === "ru" || locale === "en") return texts[locale];
  if (locale === "uzc") return toCyrillic(texts.uz);
  return texts.en;
}

export function courseInfo(slug: string, courseName: string) {
  const info = COURSE_INFO[slug];
  return {
    info,
    icon: info?.icon ?? SUBJECT_ICONS[courseName] ?? ({ icon: "book" } as CourseIcon),
  };
}

// First sentence of the admin description (fallback summary)
export function firstSentence(text: string | undefined) {
  if (!text) return "";
  const line = text.trim().split("\n")[0];
  return line.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? line;
}
