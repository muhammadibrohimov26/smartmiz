import { Metadata } from "next";
import { getCourses, getSiteSettings } from "@/lib/data";
import { formatCount } from "@/lib/numbers";
import { yearsActive } from "@/lib/years";
import AboutContent from "../_components/aboutContent";

// A function (not a constant) so the years are recomputed on every regeneration
export async function generateMetadata(): Promise<Metadata> {
  const years = yearsActive();
  const students = formatCount((await getSiteSettings()).studentCount, "uz");
  return {
    title: "Biz haqimizda - Smartmiz o'quv markazi",
    description: `Smartmiz o'quv markazi tarixi, yutuqlari va o'quv faoliyati haqida batafsil ma'lumot oling. ${years} yillik ta'lim tajribasi va ${students} dan ortiq muvaffaqiyatli bitiruvchilar.`,
    keywords: `Smartmiz haqida, Smartmiz tarixi, Smartmiz o'quv markazi jamoasi, Farg'ona chet tillari maktabi, Smartmiz yutuqlari, o'quv markazi tarixi, ${years} yillik tajriba, Farg'ona o'quv markazlari`,
  };
}

// Re-rendered on demand when a course is changed in the admin panel
export const revalidate = 3600;

async function AboutPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSiteSettings()]);
  return <AboutContent courses={courses} studentCount={settings.studentCount} />;
}

export default AboutPage;
