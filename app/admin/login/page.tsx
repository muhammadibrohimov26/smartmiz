import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminLoginForm from "./loginForm";

// Already signed in (valid session cookie) → straight to the panel instead of the form
async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <AdminLoginForm />;
}

export default AdminLoginPage;
