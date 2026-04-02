import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categories = [
  { label: "Performance", score: 52 },
  { label: "SEO", score: 88 },
  { label: "Accessibility", score: 30 },
  { label: "Trust & Security", score: 35 },
  { label: "Quality", score: 67 },
  { label: "AI Readiness", score: 44 },
];

function dotColor(score: number) {
  if (score >= 90) return "#059669";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

export default async function OpenGraphImage() {
  const spaceGrotesk = await fetch(
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700",
  ).then(async (res) => {
    const css = await res.text();
    const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!fontUrl) throw new Error("Font URL not found");
    return fetch(fontUrl).then((r) => r.arrayBuffer());
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f7f6f2",
          padding: "64px 72px",
          fontFamily: "Space Grotesk, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top: Brand name */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          }}
        >
          Vivotiv
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 56,
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 62,
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            <span>Your website might be</span>
            <span>costing you customers</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#656565",
              lineHeight: 1.4,
            }}
          >
            Find out exactly where. 30-second scan, no signup.
          </div>
        </div>

        {/* Bottom: Category pills */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            gap: 10,
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#f0eded",
                padding: "12px 18px",
                border: "1px solid #e3e0dd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: dotColor(cat.score),
                }}
              />
              <span
                style={{
                  display: "flex",
                  fontSize: 14,
                  color: "#656565",
                }}
              >
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGrotesk,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
