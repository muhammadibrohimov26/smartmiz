import { getApprovedReviews, getCourses } from "@/lib/data";
import { Metadata } from "next";
import HomeContent from "../_components/homeContent";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Re-rendered on demand when a course or review is changed in the admin panel
export const revalidate = 3600;

async function Homepage() {
  const [prices, reviews] = await Promise.all([getCourses(), getApprovedReviews()]);
  return <HomeContent prices={prices} reviews={reviews} />;
}

export default Homepage;
