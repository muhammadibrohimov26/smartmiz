import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getNews, getSiteSettings } from "@/lib/data";
import NewsContent from "./_components/newsContent";

export const metadata: Metadata = pageMetadata({
  title: "Muvaffaqiyatlar — Smartmiz oʻquvchilari natijalari",
  description: "Smartmiz oʻquv markazi oʻquvchilarining IELTS, TOPIK, CEFR va boshqa imtihonlardagi natijalari.",
  path: "/news",
  keywords: ["Smartmiz natijalar", "IELTS natijalari Fargʻona", "TOPIK natijalari", "CEFR sertifikat", "EPS-TOPIK Fargʻona"],
});

// Re-rendered on demand when a result is changed in the admin panel
export const revalidate = 3600;

async function NewsPage() {
  const [news, settings] = await Promise.all([getNews(), getSiteSettings()]);
  return <NewsContent news={news} studentCount={settings.studentCount} />;
}

export default NewsPage;
