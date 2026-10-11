import { getSiteSettings } from "@/lib/data";
import { ensureAdminPage } from "@/lib/auth";
import SettingsForm from "../../_components/settingsForm";

async function AdminSettingsPage() {
  await ensureAdminPage();
  const settings = await getSiteSettings({ strict: true });
  return <SettingsForm settings={settings} />;
}

export default AdminSettingsPage;
