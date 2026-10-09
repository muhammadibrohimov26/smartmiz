import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 kun

// Returns the admin's decoded session, or null if the visitor is not the admin.
// The admin is the Firebase user that has the custom claim { admin: true }
// (set once with `npm run set-admin -- <email>`).
export async function getAdminSession() {
  if (!isFirebaseConfigured()) return null;

  const cookie = cookies().get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// For admin pages: Next renders layouts and pages in parallel, so each page
// checks the session itself before loading any data.
export async function ensureAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
