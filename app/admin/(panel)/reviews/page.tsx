import { getAllReviews } from "@/lib/data";
import { ensureAdminPage } from "@/lib/auth";
import ReviewsTable from "../../_components/reviewsTable";

async function AdminReviewsPage() {
  await ensureAdminPage();
  const reviews = await getAllReviews();
  return <ReviewsTable reviews={reviews} />;
}

export default AdminReviewsPage;
