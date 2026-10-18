import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #34d399 0%, #059669 50%, #115e59 100%)",
          borderRadius: "16px",
          border: "2.5px solid #fcd34d",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            PW
          </span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 800,
              color: "#fde68a",
              letterSpacing: "1px",
              marginTop: 2,
            }}
          >
            BISE
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
