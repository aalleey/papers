import { ImageResponse } from "next/og";

export const alt = "PaperWala – #1 Online Paper Maker & Board Pattern Exam Generator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Brand Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "24px",
              background: "linear-gradient(145deg, #34d399 0%, #059669 60%, #115e59 100%)",
              border: "4px solid #fbbf24",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            }}
          >
            <span style={{ fontSize: "40px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
              PW
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#fef08a", marginTop: "2px" }}>
              BISE
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "44px", fontWeight: 900, letterSpacing: "-1px" }}>
              PaperWala
            </span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#6ee7b7", letterSpacing: "2px" }}>
              ONLINE PAPER MAKER • BOARD EXAM STUDIO
            </span>
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-2px",
              color: "#ffffff",
            }}
          >
            Create Board-Pattern Exam Papers Online in 60 Seconds
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 600,
              color: "#cbd5e1",
              lineHeight: 1.4,
            }}
          >
            9th, 10th, 1st Year & 2nd Year • All Punjab Boards (BISE) & Federal Board (FBISE) • Bilingual English & Urdu Nastaliq • 1-Page PDF & Word (.docx)
          </div>
        </div>

        {/* Bottom Feature Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.15)",
            paddingTop: "24px",
            fontSize: "20px",
            fontWeight: 700,
            color: "#fde68a",
          }}
        >
          <span>✓ AI Quick Paper & OCR</span>
          <span>✓ 4 Shuffled Codes (A/B/C/D)</span>
          <span>✓ Editable Word (.docx) & 1-Page PDF</span>
          <span style={{ color: "#34d399" }}>paperwala.world</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
