import { Metadata } from "next";
import { getNews } from "@/lib/data";
import NewsContent from "./_components/newsContent";

export const metadata: Metadata = {
  title: "Muvaffaqiyatlar - Smartmiz o'quvchilarining natijalari",
  description: "Smartmiz o'quv markazida IELTS 7.5+, TOPIK 5, CEFR C1 va EPS-TOPIK imtihonlarini muvaffaqiyatli topshirgan o'quvchilarimizning real hayotiy yutuqlari va ularning fikr-mulohazalari.",
  keywords: "Smartmiz muvaffaqiyatlar, IELTS natijalari Farg'ona, TOPIK imtihon natijalari, CEFR C1 sertifikat Uzbekistan, EPS-TOPIK Farg'ona, Smartmiz o'quvchilar fikrlari, o'quv markazi natijalari"
};

// Re-rendered on demand when a result is changed in the admin panel
export const revalidate = 3600;

async function NewsPage() {
  const news = await getNews();
  return <NewsContent news={news} />;
}

export default NewsPage;
