import { getNews } from "@/lib/data";
import { ensureAdminPage } from "@/lib/auth";
import NewsManager from "../../_components/newsManager";

async function AdminNewsPage() {
  await ensureAdminPage();
  const news = await getNews();
  return <NewsManager news={news} />;
}

export default AdminNewsPage;
