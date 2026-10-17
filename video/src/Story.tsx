import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, interpolate } from "remotion";
import { AFFECTS, PANEL, RENDER, THUMB, TRAIL, VARS, frameAt, sim, sliderBox, thumbX, ticks, type Part } from "./timeline";

const FIELD = "#06b6d4";
const DEEP = "oklch(0.2 0.035 225)";
const MUTED = `color-mix(in oklch, ${DEEP} 72%, ${FIELD})`;
const S = 2.5; // video px per site CSS px
const fmt = (n: number) => n.toFixed(1);

function useFonts() {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([500, 600, 700].map((w) => new FontFace("General Sans", `url(${staticFile(`fonts/general-sans-${w}.woff2`)})`, { weight: String(w) }).load().then((f) => document.fonts.add(f))))
      .then(() => continueRender(h));
  }, [h]);
}

function Canvas({ frame }: { frame: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const w = RENDER.w / S, h = RENDER.h / S;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const fr = frameAt(frame), { end, reset } = sim[Math.min(frame, sim.length - 1)];
    const lit: Part | null = fr.active ? AFFECTS[fr.active] : null;
    const ppm = (Math.min(w, h) * 0.46) / 8.1, ox = w / 2, oy = h * 0.47;
    const pos = (i: number) => {
      const { s } = ticks[i], { L1, L2 } = fr.p;
      const x1 = ox + L1 * ppm * Math.sin(s[0]), y1 = oy + L1 * ppm * Math.cos(s[0]);
      return { x1, y1, x2: x1 + L2 * ppm * Math.sin(s[1]), y2: y1 + L2 * ppm * Math.cos(s[1]) };
    };
    const glow = "oklch(0.99 0.01 210)";
    const alpha = (part: Part) => (lit && lit !== "gravity" && lit !== part ? 0.22 : 1);
    const colour = (part: Part) => (lit === part ? glow : DEEP);
    ctx.lineCap = "round";
    // trail
    const start = Math.max(reset, end - TRAIL);
    const pts = [];
    for (let i = start; i < end; i++) pts.push(pos(i));
    ctx.globalAlpha = alpha("bob2") === 1 ? 1 : 0.22;
    for (let i = 1; i < pts.length; i++) {
      const a = i / pts.length;
      ctx.strokeStyle = `oklch(0.2 0.035 225 / ${a * 0.55})`;
      ctx.lineWidth = 1 + a * 2;
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x2, pts[i - 1].y2); ctx.lineTo(pts[i].x2, pts[i].y2); ctx.stroke();
    }
    const { x1, y1, x2, y2 } = pos(end - 1);
    for (const [part, ax, ay, bx, by] of [["arm1", ox, oy, x1, y1], ["arm2", x1, y1, x2, y2]] as const) {
      ctx.globalAlpha = alpha(part); ctx.strokeStyle = colour(part); ctx.lineWidth = lit === part ? 4 : 2.5;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
    const radius = (m: number) => 3 + 6 * Math.cbrt(m);
    const { m1, m2, g } = fr.p;
    for (const [x, y, r, part] of [[ox, oy, 4, "arm1"], [x1, y1, radius(m1) + (lit === "bob1" ? 2 : 0), "bob1"], [x2, y2, radius(m2) + (lit === "bob2" ? 2 : 0), "bob2"]] as const) {
      ctx.globalAlpha = alpha(part === "bob1" && lit === "arm1" ? "arm1" : part); ctx.fillStyle = colour(part);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    if (lit === "gravity") {
      const len = g * Math.min(w, h) * 0.006;
      ctx.globalAlpha = 1; ctx.strokeStyle = glow; ctx.fillStyle = glow; ctx.lineWidth = 3;
      for (const [x, y, r] of [[x1, y1, radius(m1)], [x2, y2, radius(m2)]] as const) {
        const top = y + r + 3, tip = top + len;
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, tip - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, tip); ctx.lineTo(x - 6, tip - 9); ctx.lineTo(x + 6, tip - 9); ctx.closePath(); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame]);
  return <canvas ref={ref} width={RENDER.w} height={RENDER.h} style={{ position: "absolute", inset: 0 }} />;
}

// Press feedback eased over ~130 ms, like the site's 150 ms thumb transition.
const pressAmount = (frame: number, test: (f: number) => boolean) => {
  let a = 0;
  for (let f = Math.max(0, frame - 4); f <= frame; f++) a = a + ((test(f) ? 1 : 0) - a) * 0.55;
  return a;
};

export function Story() {
  useFonts();
  const frame = useCurrentFrame();
  const fr = frameAt(frame);
  const v = fr.active ? VARS.find((x) => x.key === fr.active)! : null;
  const fingerDown = pressAmount(frame, (f) => frameAt(f).down);
  const intro = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: FIELD, color: DEEP, fontFamily: "General Sans, sans-serif" }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 236, opacity: intro }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>Equanim</div>
        <div style={{ fontSize: 38, fontWeight: 500, color: MUTED, marginTop: 14 }}>Physics from a JSON spec, running live</div>
      </div>

      <div style={{ position: "absolute", left: RENDER.x, top: RENDER.y, width: RENDER.w, height: RENDER.h, borderRadius: 60, overflow: "hidden", background: "oklch(1 0 0 / 0.18)" }}>
        <Canvas frame={frame} />
        <div style={{ position: "absolute", left: 40, bottom: 40, borderRadius: 999, background: "oklch(1 0 0 / 0.85)", padding: "10px 30px", fontSize: 34, fontWeight: 600 }}>
          {v ? `${v.label}: ${fmt(fr.p[v.key])} ${v.unit}` : "Running live, RK4"}
        </div>
      </div>

      <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 60, background: "oklch(1 0 0 / 0.18)" }} />
      {VARS.map((d, i) => {
        const b = sliderBox(i);
        const held = pressAmount(frame, (f) => frameAt(f).active === d.key);
        const tx = thumbX(i, fr.p[d.key]);
        return (
          <div key={d.key}>
            <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 34, fontWeight: 500 }}>
              <span>{d.label} <span style={{ fontFamily: "ui-monospace, Menlo, monospace", color: MUTED, fontSize: 31 }}>{d.key}</span></span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(fr.p[d.key])} {d.unit}</span>
            </div>
            <div style={{ position: "absolute", left: b.x, top: b.trackY - 5, width: b.w, height: 10, borderRadius: 999, background: `color-mix(in oklch, ${DEEP} 35%, transparent)` }} />
            <div style={{ position: "absolute", left: tx - THUMB / 2, top: b.trackY - THUMB / 2, width: THUMB, height: THUMB, borderRadius: 999, boxSizing: "border-box", background: DEEP, border: "8px solid oklch(0.99 0.01 210)", transform: `scale(${1 + 0.25 * held})` }} />
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, top: 1712, textAlign: "center", fontSize: 36, fontWeight: 600, color: MUTED, opacity: intro }}>davidsling.in/work/equanim</div>

      <div style={{ position: "absolute", left: fr.fx - 55, top: fr.fy - 55, width: 110, height: 110, borderRadius: 999, boxSizing: "border-box", opacity: fr.fingerIn,
        background: `oklch(1 0 0 / ${0.45 + 0.3 * fingerDown})`, border: "5px solid oklch(0.2 0.035 225 / 0.5)", transform: `scale(${1 - 0.2 * fingerDown})` }} />
    </AbsoluteFill>
  );
}
