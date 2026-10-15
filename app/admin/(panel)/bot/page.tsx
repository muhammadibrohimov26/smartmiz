import { ensureAdminPage } from "@/lib/auth";
import { getBotStatus } from "@/lib/bot/status";
import BotSettings from "../../_components/botSettings";

async function AdminBotPage() {
  await ensureAdminPage();
  const status = await getBotStatus();
  return <BotSettings status={status} />;
}

export default AdminBotPage;
