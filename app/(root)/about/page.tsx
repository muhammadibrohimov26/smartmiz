import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getCourses, getSiteSettings } from "@/lib/data";
import { formatCount } from "@/lib/numbers";
import { yearsActive } from "@/lib/years";
import AboutContent from "../_components/aboutContent";

// A function (not a constant) so the years are recomputed on every regeneration
export async function generateMetadata(): Promise<Metadata> {
  const years = yearsActive();
  const students = formatCount((await getSiteSettings()).studentCount, "uz");
  return pageMetadata({
    title: "Biz haqimizda — Smartmiz oʻquv markazi",
    description: `Smartmiz — ${years} yillik tajribaga ega oʻquv markazi, ${students}+ bitiruvchi. Markaz tarixi va yutuqlari bilan tanishing.`,
    path: "/about",
    keywords: ["Smartmiz haqida", "Smartmiz tarixi", "Fargʻona oʻquv markazi", `${years} yillik tajriba`],
  });
}

// Re-rendered on demand when a course is changed in the admin panel
export const revalidate = 3600;

async function AboutPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSiteSettings()]);
  return <AboutContent courses={courses} studentCount={settings.studentCount} videoUrl={settings.aboutVideoUrl} videoImage={settings.aboutVideoImage} />;
}

export default AboutPage;
