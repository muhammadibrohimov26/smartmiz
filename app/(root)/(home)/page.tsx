import { getCourses } from "@/lib/data";
import HomeContent from "../_components/homeContent";

// Re-rendered on demand when a course is changed in the admin panel
export const revalidate = 3600;

async function Homepage() {
  const prices = await getCourses();
  return <HomeContent prices={prices} />;
}

export default Homepage;
