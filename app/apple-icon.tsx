import { ImageResponse } from "next/og";

// iOS home-screen icon (iOS does not use SVG favicons). Same mark as app/icon.svg.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const mark =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M12 52 L32 12 L52 52 H43 L32 30 L21 52 Z" fill="#ffffff"/><path d="M32 37 L39.5 52 H24.5 Z" fill="#4be033"/></svg>';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0c0c" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml,${encodeURIComponent(mark)}`} width={150} height={150} alt="" />
      </div>
    ),
    size
  );
}
