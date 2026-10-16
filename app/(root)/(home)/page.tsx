import { getApprovedReviews, getCourses, getSiteSettings } from "@/lib/data";
import { Metadata } from "next";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { dictionaries } from "@/lib/dictionaries";
import { courseLabel, formatHours, uniqueCourses } from "@/lib/courses";
import { Price } from "@/types";
import HomeContent from "../_components/homeContent";

export const metadata: Metadata = pageMetadata({
  title: "Smartmiz — chet tillari va kompyuter kurslari Fargʻonada",
  description:
    "Fargʻonadagi Smartmiz oʻquv markazi: ingliz (IELTS, CEFR), rus, koreys (EPS-TOPIK), arab, turk tillari va kompyuter kurslari. Bepul sinov darsiga yoziling.",
  path: "/",
  keywords: ["Smartmiz", "oʻquv markazi Fargʻona", "ingliz tili kursi Fargʻona", "IELTS Fargʻona", "CEFR", "rus tili kursi", "koreys tili kursi", "EPS-TOPIK", "arab tili kursi", "turk tili kursi", "kompyuter kursi Fargʻona"],
});

// Re-rendered on demand when a course, review or setting is changed in the admin panel
export const revalidate = 3600;

// Structured data for search engines: the course list and the FAQ (in Uzbek).
// Prices are left out until it is settled whether they are monthly or per course.
function homeJsonLd(prices: Price[]) {
  const uz = dictionaries.uz as Record<string, string>;
  const provider = { "@id": `${SITE_URL}/#organization` };
  const courses = uniqueCourses(prices).map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Course",
      name: courseLabel(c),
      description: `${courseLabel(c)} kursi — Smartmiz oʻquv markazi, Fargʻona. Bitta dars ${formatHours(c.courseTime, "uz")} soat.`,
      provider,
      url: `${SITE_URL}/#courses-section`,
    },
  }));
  const faq = [1, 2, 3, 4, 5, 6, 7]
    .filter((n) => uz[`faq${n}Q`] && uz[`faq${n}A`])
    .map((n) => ({
      "@type": "Question",
      name: uz[`faq${n}Q`],
      acceptedAnswer: { "@type": "Answer", text: uz[`faq${n}A`] },
    }));
  return [
    { "@context": "https://schema.org", "@type": "ItemList", name: "Smartmiz kurslari", itemListElement: courses },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq },
  ];
}

async function Homepage() {
  const [prices, reviews, settings] = await Promise.all([getCourses(), getApprovedReviews(), getSiteSettings()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(prices)) }} />
      <HomeContent prices={prices} reviews={reviews} settings={settings} />
    </>
  );
}

export default Homepage;
