import { useEffect, useRef } from "react";

/** A part of the drawing that a spec block can point at. */
export type PendulumPart =
  "arm1" | "arm2" | "bob1" | "bob2" | "trace" | "gravity";

/**
 * A live double pendulum in the spirit of Equanim's own example spec: the
 * state is integrated with RK4 every frame and the lower bob leaves a
 * fading trail. Runs only while on screen; reduced motion draws one still
 * frame of an already-traced path.
 */
export type State = [number, number, number, number]; // θ1, θ2, ω1, ω2

/** Equanim's double-pendulum variables: arm lengths (m), bob masses (kg), gravity (m/s²). */
export type PendulumParams = {
  L1: number;
  L2: number;
  m1: number;
  m2: number;
  g: number;
};

// The look used on the landing page and in heroes: equal arms and masses.
const DEFAULT: PendulumParams = { L1: 1, L2: 1, m1: 1, m2: 1, g: 9.81 };

// The same equations as Equanim's example spec, term for term.
export function derive(
  [t1, t2, w1, w2]: State,
  { L1, L2, m1, m2, g }: PendulumParams,
): State {
  const d = t1 - t2;
  const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
  const a1 =
    (-g * (2 * m1 + m2) * Math.sin(t1) -
      m2 * g * Math.sin(t1 - 2 * t2) -
      2 * Math.sin(d) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) /
    (L1 * den);
  const a2 =
    (2 *
      Math.sin(d) *
      (w1 * w1 * L1 * (m1 + m2) +
        g * (m1 + m2) * Math.cos(t1) +
        w2 * w2 * L2 * m2 * Math.cos(d))) /
    (L2 * den);
  return [w1, w2, a1, a2];
}

export function rk4(s: State, h: number, p: PendulumParams): State {
  const add = (a: State, b: State, k: number) =>
    a.map((v, i) => v + b[i] * k) as State;
  const k1 = derive(s, p);
  const k2 = derive(add(s, k1, h / 2), p);
  const k3 = derive(add(s, k2, h / 2), p);
  const k4 = derive(add(s, k3, h), p);
  return s.map(
    (v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]),
  ) as State;
}

export function Pendulum({
  className,
  active = true,
  highlight = null,
  params,
  fit,
}: {
  className?: string;
  active?: boolean;
  /** Brightens one part and dims the rest (Equanim's spec-beside-render). */
  highlight?: PendulumPart | null;
  /** Live variables; leave out for the default look. */
  params?: PendulumParams;
  /** The longest L1 + L2 the drawing must fit, so arm lengths read true to scale. */
  fit?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const lit = useRef(highlight);
  const vars = useRef(params ?? DEFAULT);
  const live = params !== undefined;
  const redraw = useRef<() => void>(() => {});
  const retune = useRef<() => void>(() => {});

  useEffect(() => {
    lit.current = highlight;
    redraw.current();
  }, [highlight]);

  useEffect(() => {
    if (!params) return;
    vars.current = params;
    retune.current();
  }, [params]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start: State = [2.2, 2.6, 0, 0];
    let state: State = start;
    const trail: { x: number; y: number }[] = [];
    let raf = 0;
    let visible = false;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ink = "oklch(0.2 0.035 225)";
    const glow = "oklch(0.99 0.01 210)";
    // Lit part in near-white, the rest faded back; nothing lit draws as normal.
    // Gravity acts on the whole system, so lighting it dims nothing.
    const alpha = (part: PendulumPart) =>
      lit.current && lit.current !== "gravity" && lit.current !== part
        ? 0.22
        : 1;
    const colour = (part: PendulumPart) => (lit.current === part ? glow : ink);

    const geometry = () => {
      // Pixels per metre: the default look keeps its old size; live variables scale to fit.
      const ppm = fit ? (Math.min(w, h) * 0.46) / fit : Math.min(w, h) * 0.2;
      const { L1, L2 } = vars.current;
      const ox = w / 2;
      const oy = h * 0.47;
      const x1 = ox + L1 * ppm * Math.sin(state[0]);
      const y1 = oy + L1 * ppm * Math.cos(state[0]);
      return {
        ox,
        oy,
        x1,
        y1,
        x2: x1 + L2 * ppm * Math.sin(state[1]),
        y2: y1 + L2 * ppm * Math.cos(state[1]),
      };
    };

    const paint = () => {
      const { ox, oy, x1, y1, x2, y2 } = geometry();
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.globalAlpha = alpha("trace");
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        ctx.strokeStyle =
          lit.current === "trace"
            ? `oklch(0.99 0.01 210 / ${a})`
            : `oklch(0.2 0.035 225 / ${a * 0.55})`;
        ctx.lineWidth = (lit.current === "trace" ? 1.5 : 1) + a * 2;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
      for (const [part, ax, ay, bx, by] of [
        ["arm1", ox, oy, x1, y1],
        ["arm2", x1, y1, x2, y2],
      ] as const) {
        ctx.globalAlpha = alpha(part);
        ctx.strokeStyle = colour(part);
        ctx.lineWidth = lit.current === part ? 4 : 2.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      // Bob size follows mass when the variables are live; the default look keeps its 9px bobs.
      const radius = (m: number) => (live ? 3 + 6 * Math.cbrt(m) : 9);
      const { m1, m2, g } = vars.current;
      for (const [x, y, r, part] of [
        [ox, oy, 4, "arm1"],
        [x1, y1, radius(m1) + (lit.current === "bob1" ? 2 : 0), "bob1"],
        [x2, y2, radius(m2) + (lit.current === "bob2" ? 2 : 0), "bob2"],
      ] as const) {
        ctx.globalAlpha = alpha(
          part === "bob1" && lit.current === "arm1" ? "arm1" : part,
        );
        ctx.fillStyle = colour(part);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Gravity: a downward arrow on each bob, its length proportional to g.
      if (lit.current === "gravity") {
        const len = g * Math.min(w, h) * 0.006;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = glow;
        ctx.fillStyle = glow;
        ctx.lineWidth = 3;
        for (const [x, y, r] of [
          [x1, y1, radius(m1)],
          [x2, y2, radius(m2)],
        ] as const) {
          const top = y + r + 3;
          const tip = top + len;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, tip - 6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, tip);
          ctx.lineTo(x - 6, tip - 9);
          ctx.lineTo(x + 6, tip - 9);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      const { x2, y2 } = geometry();
      trail.push({ x: x2, y: y2 });
      if (trail.length > 260) trail.shift();
      paint();
    };
    redraw.current = paint;

    // One 60 fps frame of real time, in substeps sized to how fast the system swings.
    const advance = () => {
      const p = vars.current;
      const n = Math.max(
        4,
        Math.ceil(4 * Math.sqrt(p.g / Math.min(p.L1, p.L2))),
      );
      for (let i = 0; i < n; i++) state = rk4(state, 1 / (60 * n), p);
    };

    const step = () => {
      advance();
      draw();
      raf = requestAnimationFrame(step);
    };

    // Reduced motion: one still frame of a path already traced.
    const pretrace = () => {
      state = start;
      trail.length = 0;
      for (let frame = 0; frame < 275; frame++) {
        advance();
        draw();
      }
    };

    // A changed variable starts a fresh trace so the new motion reads clearly.
    retune.current = () => {
      trail.length = 0;
      if (reduce) pretrace();
      else paint();
    };

    resize();
    if (reduce) pretrace();
    else draw();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && active && !reduce) raf = requestAnimationFrame(step);
    });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [active, fit, live]);

  return <canvas ref={canvas} className={className} aria-hidden />;
}
