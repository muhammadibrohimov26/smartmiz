import { ImageResponse } from "next/og";

// iOS home-screen icon (iOS does not use SVG favicons): app/icon.svg as a PNG.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const icon = await fetch(new URL("./icon.svg", import.meta.url)).then((res) => res.text());
  return new ImageResponse(
    (
      // iOS rounds the corners itself; the dark fill hides the SVG's own rounding
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0c0c0c" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml,${encodeURIComponent(icon)}`} width={180} height={180} alt="" />
      </div>
    ),
    size
  );
}
