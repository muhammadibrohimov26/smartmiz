import { getLeads } from "@/lib/data";
import { ensureAdminPage } from "@/lib/auth";
import LeadsTable from "../../_components/leadsTable";

async function AdminLeadsPage() {
  await ensureAdminPage();
  const leads = await getLeads();
  return <LeadsTable leads={leads} />;
}

export default AdminLeadsPage;
