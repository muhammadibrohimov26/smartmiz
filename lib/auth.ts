import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 kun

// The admin is the Firebase user that has the custom claim { admin: true }
// (set once with `npm run set-admin -- <email>`).
//
// Checking whether a session was revoked costs a round trip to Firebase Auth,
// so it is done only for changes (server actions → requireAdmin). Page views
// verify the cookie's signature and expiry locally, once per request (the
// layout and the page share the result via React cache()).
const verifySession = cache(async (cookie: string, checkRevoked: boolean) => {
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, checkRevoked);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
});

// The admin's decoded session, or null if the visitor is not the admin.
export async function getAdminSession({ checkRevoked = false } = {}) {
  if (!isFirebaseConfigured()) return null;
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  return verifySession(cookie, checkRevoked);
}

// For server actions that change data: full check, including revocation (logout).
export async function requireAdmin() {
  const session = await getAdminSession({ checkRevoked: true });
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
