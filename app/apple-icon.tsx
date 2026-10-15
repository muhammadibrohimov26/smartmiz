import { ImageResponse } from "next/og";

// iOS home-screen icon (iOS does not use SVG favicons). Same mark as app/icon.svg.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const mark =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="b"><rect width="64" height="52"/></clipPath></defs><g clip-path="url(#b)"><path d="M16 54l16-38 16 38" fill="none" stroke="#ffffff" stroke-width="7" stroke-linejoin="miter" stroke-miterlimit="2"/><path d="M32 37l7 15H25z" fill="#4BE033"/></g></svg>';

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
