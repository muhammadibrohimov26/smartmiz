import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseReviews, getCourses, getNews } from "@/lib/data";
import { courseLabel, courseSlug, courseSpecialization, uniqueCourses } from "@/lib/courses";
import { isTemplateCourseImage } from "@/lib/images";
import { resultsForCourse } from "@/lib/results";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import CourseDetail from "./_components/courseDetail";

// One course: details, results of its students and its ratings.
// Re-rendered when courses, results or ratings change (admin panel).
export const revalidate = 3600;

export async function generateStaticParams() {
  return uniqueCourses(await getCourses()).map((c) => ({ slug: courseSlug(c) }));
}

async function findCourse(slug: string) {
  return (await getCourses()).find((c) => courseSlug(c) === slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await findCourse(params.slug);
  if (!course) return {};
  const label = courseLabel(course);
  return pageMetadata({
    title: `${label} kursi Fargʻonada — Smartmiz`,
    description:
      course.description?.slice(0, 160) ||
      `${label} kursi Smartmiz oʻquv markazida: narxi, darslar, oʻquvchilar natijalari va baholari. Bepul sinov darsiga yoziling.`,
    path: `/courses/${params.slug}`,
    keywords: [`${label} kursi`, `${course.courseName} Fargʻona`, "Smartmiz"],
    image: course.image && !isTemplateCourseImage(course.image) ? { url: course.image, alt: `${label} kursi` } : undefined,
  });
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await findCourse(params.slug);
  if (!course) notFound();

  const [news, reviews] = await Promise.all([getNews(), getCourseReviews(params.slug)]);
  const label = courseLabel(course);
  const results = resultsForCourse(news, { courseName: course.courseName, label, spec: courseSpecialization(course) });

  // Course and (once rated) its average rating, for search engines. The price is
  // left out until it is settled whether it is monthly or for the whole course.
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${label} kursi`,
    description: course.description || `${label} kursi — Smartmiz oʻquv markazi, Fargʻona.`,
    url: `${SITE_URL}/courses/${params.slug}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(reviews.length
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: average.toFixed(1), reviewCount: reviews.length, bestRating: 5 } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CourseDetail course={course} slug={params.slug} results={results} reviews={reviews} />
    </>
  );
}
