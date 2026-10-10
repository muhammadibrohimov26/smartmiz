// Hosts allowed for course/result images. Keep in sync with
// images.remotePatterns in next.config.mjs — next/image throws on other hosts.
export const IMAGE_HOSTS = [
  "idyllic-sprite-7cad0a.netlify.app",
  "firebasestorage.googleapis.com",
];

export function isAllowedImageUrl(url: string) {
  if (!url) return true;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}
