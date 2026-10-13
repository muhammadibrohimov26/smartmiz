import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";

// Serves images uploaded in the admin panel (see lib/media.ts).
// Ids are random and never reused, so responses can be cached forever.

export const runtime = "nodejs";

const ID_RE = /^[0-9a-f-]{36}$/;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!ID_RE.test(params.id) || !isFirebaseConfigured()) return new Response("Not found", { status: 404 });

  const doc = await adminDb().collection("media").doc(params.id).get();
  const data = doc.get("data") as Buffer | undefined;
  if (!doc.exists || !data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": String(doc.get("contentType") ?? "application/octet-stream"),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
