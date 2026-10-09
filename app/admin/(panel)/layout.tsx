import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { ChildProps } from "@/types";
import AdminNav from "../_components/adminNav";

export const metadata: Metadata = {
  title: "Admin panel - Smartmiz",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function AdminLayout({ children }: ChildProps) {
  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="max-w-md font-medium">
          Firebase Admin sozlanmagan. <code>.env.local</code> fayliga
          FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL va FIREBASE_PRIVATE_KEY ni qo&apos;shing.
        </p>
      </div>
    );
  }

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 md:flex">
      <AdminNav email={session.email ?? ""} />
      <main className="flex-1 p-4 md:p-10 max-w-6xl">{children}</main>
    </div>
  );
}

export default AdminLayout;
