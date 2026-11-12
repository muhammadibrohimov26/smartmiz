import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/data";

// Clears the cached Firestore data (lib/data.ts) after a change, so public
// pages show it right away instead of after CACHE_SECONDS.
export function revalidateData(...tags: (keyof typeof CACHE_TAGS)[]) {
  for (const tag of tags) revalidateTag(CACHE_TAGS[tag]);
}
