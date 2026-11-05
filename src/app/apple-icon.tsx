import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Isti znak kao u <Logo />: dva prstena koja se preklapaju
export default function AppleIcon() {
  const ring = { position: "absolute", top: 50, width: 80, height: 80, borderRadius: 999, border: "14px solid #0a0a0a" } as const;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#fff" }}>
        <div style={{ ...ring, left: 26 }} />
        <div style={{ ...ring, left: 74 }} />
      </div>
    ),
    size,
  );
}
