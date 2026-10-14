import { ImageResponse } from "next/og";

// Edge runtime: the Node.js renderer of next/og fails on Windows paths in Next 14
export const runtime = "edge";

// Link preview image (Telegram, Facebook, …) for every page; generated on first request, then cached.
export const alt = "Smartmiz — chet tillari va kompyuter kurslari, Fargʻona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await fetch(new URL("../public/smartlogo.png", import.meta.url)).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0c",
          padding: "56px 72px",
          position: "relative",
        }}
      >
        {/* Decorative circles in the brand yellow */}
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "60px solid rgba(255,184,0,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: -90,
            width: 220,
            height: 220,
            borderRadius: 9999,
            background: "rgba(255,184,0,0.10)",
          }}
        />

        {/* Logo (the PNG has wide transparent margins, so it is cropped by its box) */}
        <div style={{ display: "flex", width: 720, height: 210, overflow: "hidden", marginLeft: -40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo as unknown as string} width={760} height={507} style={{ marginTop: -150 }} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 120, height: 10, background: "#FFB800", borderRadius: 9999, marginBottom: 28 }} />
          <div style={{ fontSize: 76, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, letterSpacing: -2 }}>
            Chet tillari va
          </div>
          <div style={{ fontSize: 76, fontWeight: 900, color: "#FFB800", lineHeight: 1.05, letterSpacing: -2 }}>
            kompyuter kurslari
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa", marginTop: 28 }}>
            Fargʻona · smartmiz.uz
          </div>
        </div>
      </div>
    ),
    size
  );
}
