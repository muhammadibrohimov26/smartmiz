import { getCourses } from "@/lib/data";
import { ensureAdminPage } from "@/lib/auth";
import CourseManager from "../../_components/courseManager";

async function AdminCoursesPage() {
  await ensureAdminPage();
  const courses = await getCourses();
  return <CourseManager courses={courses} />;
}

export default AdminCoursesPage;
