import { ImageResponse } from "next/og";

export const alt = "Jeet Bhuptani — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#100e0c",
          color: "#ece7df",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#9b958c" }}>
          JEETBHUPTANI.ME
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>Jeet Bhuptani</div>
          <div style={{ display: "flex", fontSize: 34, color: "#9b958c", marginTop: 16, maxWidth: 900 }}>
            Software Engineer @ Ignosis — building products, not just projects.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
