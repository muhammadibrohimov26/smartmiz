// Gives a Firebase Auth user the { admin: true } claim.
// Usage: npm run set-admin -- you@example.com
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "./firebase-admin.mjs";

const email = process.argv[2];
if (!email) {
  console.error("Foydalanish: npm run set-admin -- <email>");
  process.exit(1);
}

const auth = getAuth(initAdmin());
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin: true });
console.log(`${email} endi admin.`);
