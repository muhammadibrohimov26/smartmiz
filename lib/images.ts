// Hosts allowed for course/result images. Keep in sync with
// images.remotePatterns in next.config.mjs — next/image throws on other hosts.
export const IMAGE_HOSTS = [
  "firebasestorage.googleapis.com",
];

const MEDIA_URL = /^\/media\/[0-9a-f-]{36}$/;

// Images uploaded in the admin panel are served by app/media/[id]/route.ts.
// They are already shrunk on upload (≤ 900 KB), and the image optimizer on
// Vercel cannot fetch this dynamic route (it answers 404), so next/image must
// load them directly: <Image unoptimized={isMediaUrl(src)} … />
export function isMediaUrl(url: string | undefined | null) {
  return !!url && MEDIA_URL.test(url);
}

export function isAllowedImageUrl(url: string) {
  if (!url) return true;
  // Images uploaded in the admin panel (lib/media.ts), e.g. "/media/<uuid>"
  if (isMediaUrl(url)) return true;
  // Files in /public, e.g. "/img/robot.png"
  if (/^\/[\w\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(url) && !url.includes("..")) return true;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

// The old Canva course tiles (text "Koreys tili" etc. baked in, Uzbek only).
// Cards draw a language-neutral cover instead; real photos are shown as-is.
const TEMPLATE_COURSE_IMAGES =
  /^\/img\/(robot|kores|kompyuter|inglis|rus|arab|ielts|cefr|turk|c1|cs-soz|mentall|topik|eps)\.png$/;

export function isTemplateCourseImage(url: string) {
  return TEMPLATE_COURSE_IMAGES.test(url);
}
