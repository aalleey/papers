import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #34d399 0%, #059669 55%, #064e3b 100%)",
          borderRadius: "40px",
          border: "6px solid #fbbf24",
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
              fontSize: 84,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            PW
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#fef08a",
              letterSpacing: "2px",
              marginTop: 6,
            }}
          >
            PAPERWALA
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
