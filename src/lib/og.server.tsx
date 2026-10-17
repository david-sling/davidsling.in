import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import font500 from "@/og-assets/general-sans-500.ttf?inline";
import font600 from "@/og-assets/general-sans-600.ttf?inline";
import portrait from "@/og-assets/portrait.png?inline";

/**
 * Open Graph cards, drawn on request with satori and rasterised with resvg.
 * One layout for every page: a colour sheet on the light ground, the logo,
 * a title, a line of context and the page's address.
 */
export type Card = {
  title: string;
  summary?: string;
  meta?: string;
  path: string;
  /** Sheet colour and the ink that reads on it. */
  field: string;
  ink: string;
  portrait?: boolean;
};

const fromDataUrl = (url: string) =>
  Buffer.from(url.slice(url.indexOf(",") + 1), "base64");

const fonts = [
  { name: "General Sans", data: fromDataUrl(font500), weight: 500 as const },
  { name: "General Sans", data: fromDataUrl(font600), weight: 600 as const },
];

function Logo({ field, ink }: { field: string; ink: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontSize: 30,
        fontWeight: 600,
        color: ink,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          borderRadius: 999,
          background: ink,
        }}
      >
        <svg width="28" height="26" viewBox="0 0 79 72">
          <path
            d="M0 0L0 13.99L18.317 13.99L52.8 36L18.317 58.01L0 58.01L0 72L22.598 72L79 36L22.598 0L0 0Z"
            fill={field}
          />
        </svg>
      </div>
      David Sling
    </div>
  );
}

function Layout(card: Card) {
  const { title, summary, meta, path, field, ink } = card;
  const size = title.length > 46 ? 64 : title.length > 26 ? 76 : 96;
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: 1200,
        height: 630,
        background: "#eef2f3",
        fontFamily: "General Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          top: 28,
          left: 28,
          right: 28,
          bottom: 28,
          padding: "52px 64px",
          borderRadius: 48,
          background: field,
          color: ink,
          overflow: "hidden",
        }}
      >
        {card.portrait && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: 40,
              bottom: -2,
              width: 440,
              height: 520,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 30,
                bottom: 0,
                width: 380,
                height: 380,
                borderRadius: 999,
                background: "rgba(255,255,255,0.35)",
              }}
            />
            <img
              src={portrait}
              width={440}
              height={565}
              style={{ position: "absolute", left: 0, bottom: -60 }}
            />
          </div>
        )}
        <Logo field={field} ink={ink} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: card.portrait ? 560 : 960,
          }}
        >
          {meta && (
            <div style={{ fontSize: 26, fontWeight: 500, opacity: 0.72 }}>
              {meta}
            </div>
          )}
          <div
            style={{
              marginTop: meta ? 14 : 0,
              fontSize: size,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            {title}
          </div>
          {summary && (
            <div
              style={{
                marginTop: 22,
                fontSize: 30,
                fontWeight: 500,
                lineHeight: 1.3,
                opacity: 0.82,
              }}
            >
              {summary}
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, fontWeight: 500, opacity: 0.72 }}>
          davidsling.in{path === "/" ? "" : path}
        </div>
      </div>
    </div>
  );
}

export async function renderCard(card: Card) {
  const svg = await satori(<Layout {...card} />, {
    width: 1200,
    height: 630,
    fonts,
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
}
