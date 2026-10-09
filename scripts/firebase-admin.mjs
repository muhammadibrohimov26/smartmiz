// Shared Firebase Admin init for the CLI scripts (reads .env.local via --env-file).
import { cert, initializeApp } from "firebase-admin/app";

export function initAdmin() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL va FIREBASE_PRIVATE_KEY .env.local da bo'lishi kerak");
    process.exit(1);
  }
  return initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\n/g, "\n"),
    }),
  });
}
