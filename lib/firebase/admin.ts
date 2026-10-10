import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Server-only Firebase Admin SDK. Returns null when the env vars are not set,
// so the public site keeps working (falls back to the local JSON files).

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function isFirebaseConfigured() {
  return getAdminApp() !== null;
}

export function adminDb() {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured");
  return getFirestore(app);
}

export function adminAuth() {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured");
  return getAuth(app);
}

export function adminBucket() {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured");
  return getStorage(app).bucket();
}
