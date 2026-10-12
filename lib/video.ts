// "About" page video link, editable in the admin panel (Sozlamalar).
export const DEFAULT_ABOUT_VIDEO_URL = "https://www.instagram.com/tv/CazdM-nFCUF/?igsh=eWdscjR0OXMwcHEx";

export function isValidVideoUrl(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

// Label shown under the video card, e.g. "Instagram video"
export function videoPlatform(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith("instagram.com")) return "Instagram";
    if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
    if (host === "t.me" || host.endsWith("telegram.org")) return "Telegram";
    if (host.endsWith("tiktok.com")) return "TikTok";
  } catch {}
  return "";
}

// Background image of the video card (a /public path or a Firebase Storage URL)
export const DEFAULT_ABOUT_VIDEO_IMAGE = "/og.png";
