import { Metadata } from "next";
import NewsContent from "./_components/newsContent";

export const metadata: Metadata = {
  title: "Muvaffaqiyatlar - Smartmiz o'quvchilarining natijalari",
  description: "Smartmiz o'quv markazida IELTS 7.5+, TOPIK 5, CEFR C1 va EPS-TOPIK imtihonlarini muvaffaqiyatli topshirgan o'quvchilarimizning real hayotiy yutuqlari va ularning fikr-mulohazalari.",
  keywords: "Smartmiz muvaffaqiyatlar, IELTS natijalari Farg'ona, TOPIK imtihon natijalari, CEFR C1 sertifikat Uzbekistan, EPS-TOPIK Farg'ona, Smartmiz o'quvchilar fikrlari, o'quv markazi natijalari"
};

function NewsPage() {
  return <NewsContent />;
}

export default NewsPage;
