import { useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { FlowButton } from "@/components/flow-button";
import { SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import { rk4, type PendulumParams, type State } from "@/components/pendulum";
import { projects } from "@/lib/content";

/**
 * The 404. The zero hangs from a double pendulum (the same RK4 physics as
 * Equanim's example) pinned to the top of the sheet. At rest it reads as
 * a plain "404"; grab it and throw it, or push it from the keyboard, and
 * it swings chaotically before damping settles it back into place.
 */
export function NotFound() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1240px] px-4 pt-4 sm:px-6">
        <HangingZero path={path} />
      </main>
      <SiteFooter />
    </>
  );
}

// Pixels per metre: arms of a few hundred pixels swing like ~0.4 m arms.
const PPM = 420;
// The pin sits this far below the top of the sheet.
const PIN = 30;

function HangingZero({ path }: { path: string }) {
  const card = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const zero = useRef<HTMLSpanElement>(null);
  const arm1 = useRef<SVGLineElement>(null);
  const arm2 = useRef<SVGLineElement>(null);
  const pin = useRef<SVGCircleElement>(null);
  const bob = useRef<SVGCircleElement>(null);
  const push = useRef<() => void>(() => {});

  useEffect(() => {
    const box = card.current;
    const hole = slot.current;
    const glyph = zero.current;
    if (!box || !hole || !glyph) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Reduced motion keeps the toy but damps it hard: one short swing, no chaos.
    const damping = reduce ? 2.6 : 0.3;

    let state: State = [0, 0, 0, 0];
    let params: PendulumParams = { L1: 1, L2: 1, m1: 0.35, m2: 1, g: 9.81 };
    // Geometry in sheet pixels: the pin, and where the zero's top hangs at rest.
    let px = 0;
    let rest = { x: 0, y: 0 };
    let l1 = 0;
    let l2 = 0;
    let raf = 0;
    let drag: {
      id: number;
      dx: number;
      dy: number;
      t: number;
      w1: number;
      w2: number;
    } | null = null;

    const measure = () => {
      const b = box.getBoundingClientRect();
      const s = hole.getBoundingClientRect();
      // Where the digit's ink starts inside its line box, from the font's own metrics.
      const style = getComputedStyle(glyph);
      const ctx = document.createElement("canvas").getContext("2d");
      let inset = 0;
      if (ctx) {
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const m = ctx.measureText("0");
        const content = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
        inset =
          (s.height - content) / 2 +
          m.fontBoundingBoxAscent -
          m.actualBoundingBoxAscent;
      }
      glyph.style.transformOrigin = `50% ${inset}px`;
      rest = { x: s.left - b.left + s.width / 2, y: s.top - b.top + inset };
      px = rest.x;
      const length = Math.max(rest.y - PIN, 40);
      l1 = length * 0.52;
      l2 = length * 0.48;
      params = { ...params, L1: l1 / PPM, L2: l2 / PPM };
    };

    const joints = ([t1, t2]: State) => {
      const ex = px + l1 * Math.sin(t1);
      const ey = PIN + l1 * Math.cos(t1);
      return { ex, ey, x: ex + l2 * Math.sin(t2), y: ey + l2 * Math.cos(t2) };
    };

    const paint = () => {
      const { ex, ey, x, y } = joints(state);
      for (const [line, ax, ay, bx, by] of [
        [arm1.current, px, PIN, ex, ey],
        [arm2.current, ex, ey, x, y],
      ] as const) {
        line?.setAttribute("x1", `${ax}`);
        line?.setAttribute("y1", `${ay}`);
        line?.setAttribute("x2", `${bx}`);
        line?.setAttribute("y2", `${by}`);
      }
      pin.current?.setAttribute("cx", `${px}`);
      pin.current?.setAttribute("cy", `${PIN}`);
      bob.current?.setAttribute("cx", `${ex}`);
      bob.current?.setAttribute("cy", `${ey}`);
      const still = state.every((v) => v === 0);
      glyph.style.transform = still
        ? ""
        : `translate(${x - rest.x}px, ${y - rest.y}px) rotate(${-state[1]}rad)`;
    };

    // Settled when both arms hang straight (any whole turn counts) and barely move.
    const settled = ([t1, t2, w1, w2]: State) =>
      Math.abs(Math.sin(t1 / 2)) < 0.004 &&
      Math.abs(Math.sin(t2 / 2)) < 0.004 &&
      Math.abs(w1) < 0.04 &&
      Math.abs(w2) < 0.04;

    let last = 0;
    const step = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30) || 1 / 60;
      last = now;
      const n = 8;
      const h = dt / n;
      const decay = Math.exp(-damping * h);
      for (let i = 0; i < n; i++) {
        state = rk4(state, h, params);
        state[2] *= decay;
        state[3] *= decay;
      }
      if (settled(state)) {
        state = [0, 0, 0, 0];
        paint();
        raf = 0;
        last = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(step);
    };
    const run = () => {
      if (!raf && !drag) raf = requestAnimationFrame(step);
    };

    // Two-link reach: put the zero's top at (x, y), keeping the elbow on the side it's already on.
    const reach = (x: number, y: number): [number, number] => {
      const dx = x - px;
      const dy = y - PIN;
      const dist = Math.min(
        Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1),
        (l1 + l2) * 0.999,
      );
      const base = Math.atan2(dx, dy);
      const bend = Math.acos(
        Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)),
      );
      const near = (a: number) =>
        Math.abs(Math.atan2(Math.sin(a - state[0]), Math.cos(a - state[0])));
      const raw = near(base + bend) < near(base - bend) ? base + bend : base - bend;
      // Keep angles continuous with the current state so velocities stay sane.
      const t1 = state[0] + Math.atan2(Math.sin(raw - state[0]), Math.cos(raw - state[0]));
      const ex = px + l1 * Math.sin(t1);
      const ey = PIN + l1 * Math.cos(t1);
      const r2 = Math.atan2(
        px + Math.sin(base) * dist - ex,
        PIN + Math.cos(base) * dist - ey,
      );
      const t2 = state[1] + Math.atan2(Math.sin(r2 - state[1]), Math.cos(r2 - state[1]));
      return [t1, t2];
    };

    const local = (e: PointerEvent) => {
      const b = box.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      glyph.setPointerCapture(e.pointerId);
      const p = local(e);
      const { x, y } = joints(state);
      drag = { id: e.pointerId, dx: p.x - x, dy: p.y - y, t: e.timeStamp, w1: 0, w2: 0 };
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      glyph.dataset.held = "";
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = local(e);
      const [t1, t2] = reach(p.x - drag.dx, p.y - drag.dy);
      const dt = Math.max((e.timeStamp - drag.t) / 1000, 1 / 240);
      // Smooth the throw velocity so one jittery sample doesn't decide the fling.
      drag.w1 = drag.w1 * 0.6 + ((t1 - state[0]) / dt) * 0.4;
      drag.w2 = drag.w2 * 0.6 + ((t2 - state[1]) / dt) * 0.4;
      drag.t = e.timeStamp;
      state = [t1, t2, 0, 0];
      paint();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      // A held pointer that stopped moving lets go with no throw.
      const idle = e.timeStamp - drag.t > 80;
      const cap = reduce ? 4 : 18;
      const clamp = (w: number) => (idle ? 0 : Math.max(-cap, Math.min(cap, w)));
      state = [state[0], state[1], clamp(drag.w1), clamp(drag.w2)];
      drag = null;
      delete glyph.dataset.held;
      run();
    };

    let side = 1;
    push.current = () => {
      side = -side;
      const k = reduce ? 0.35 : 1;
      state = [state[0], state[1], state[2] + side * 3.4 * k, state[3] - side * 5.2 * k];
      run();
    };

    measure();
    paint();
    // Once the real font is in, re-measure; then one small sway says "this moves".
    let alive = true;
    let hello = 0;
    document.fonts.ready.then(() => {
      if (!alive) return;
      measure();
      paint();
      if (!reduce) {
        hello = window.setTimeout(() => {
          state = [state[0], state[1], state[2] + 0.5, state[3] - 1.9];
          run();
        }, 700);
      }
    });

    const ro = new ResizeObserver(() => {
      measure();
      paint();
    });
    ro.observe(box);
    glyph.addEventListener("pointerdown", down);
    glyph.addEventListener("pointermove", move);
    glyph.addEventListener("pointerup", up);
    glyph.addEventListener("pointercancel", up);

    return () => {
      alive = false;
      clearTimeout(hello);
      cancelAnimationFrame(raf);
      ro.disconnect();
      glyph.removeEventListener("pointerdown", down);
      glyph.removeEventListener("pointermove", move);
      glyph.removeEventListener("pointerup", up);
      glyph.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div
      ref={card}
      className="relative overflow-hidden rounded-[40px] bg-sheet px-6 pb-12 pt-[clamp(150px,22vh,220px)] text-center shadow-[0_1px_0_oklch(1_0_0/0.7)_inset] sm:pb-14"
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <line ref={arm1} className="stroke-ink-3" strokeWidth={1.5} strokeLinecap="round" />
        <line ref={arm2} className="stroke-ink-3" strokeWidth={1.5} strokeLinecap="round" />
        <circle ref={pin} r={5} className="fill-sheet stroke-ink-3" strokeWidth={1.5} />
        <circle ref={bob} r={5.5} className="fill-ink" />
      </svg>

      <h1 className="relative font-semibold leading-none tracking-[-0.05em]">
        <span className="sr-only">404: page not found</span>
        <span
          aria-hidden
          className="inline-flex select-none text-[clamp(7rem,24vw,14rem)]"
        >
          <span>4</span>
          <span ref={slot} className="relative">
            <span className="invisible">0</span>
            {/* The real digit, moved by transform only, so it's visible before any script runs. */}
            <span
              ref={zero}
              className="absolute inset-0 cursor-grab touch-none text-blue-text transition-[filter] duration-150 hover:[filter:drop-shadow(0_10px_14px_oklch(0.21_0.014_245/0.18))] data-[held]:cursor-grabbing data-[held]:[filter:drop-shadow(0_18px_22px_oklch(0.21_0.014_245/0.22))]"
            >
              0
            </span>
          </span>
          <span>4</span>
        </span>
      </h1>

      <p className="relative mx-auto mt-8 max-w-[40ch] text-[clamp(1.25rem,2.2vw,1.6rem)] font-semibold leading-snug tracking-[-0.015em]">
        Nothing lives at{" "}
        <code className="inline-block max-w-full break-all rounded-[0.4em] bg-sheet-sunk px-[0.4em] py-[0.05em] align-baseline font-mono text-[0.78em] font-medium tracking-normal text-ink shadow-[0_0_0_1px_var(--line)]">
          {path}
        </code>
      </p>
      <p className="relative mx-auto mt-4 max-w-[46ch] text-[1.1rem] text-ink-2">
        Maybe the link is old. Maybe an agent made it up. Either way, the zero
        is yours to throw around while you work out where to go.
      </p>

      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">Take me home</Link>
        </Button>
        <FlowButton asChild>
          <Link to="/blogs">Read the writing</Link>
        </FlowButton>
      </div>

      <button
        type="button"
        onClick={() => push.current()}
        data-motion="travel"
        className="relative mt-5 inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem] font-medium text-ink-2 transition-[background-color,color,transform] duration-150 ease-out-quart hover:bg-sheet-sunk hover:text-ink active:scale-[0.96] active:duration-75"
      >
        Give the zero a push
      </button>

      <nav
        aria-label="Projects"
        className="relative mx-auto mt-10 max-w-[640px] border-t border-line pt-8"
      >
        <p className="text-[0.95rem] text-ink-3">Or start with a project</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2 p-0">
          {projects.map((p) => (
            <li key={p.slug} className="list-none">
              <Link
                to="/work/$slug"
                params={{ slug: p.slug }}
                data-motion="travel"
                className="inline-flex min-h-11 items-center rounded-full bg-sheet-sunk px-4 font-medium text-ink no-underline shadow-[inset_0_0_0_1px_var(--line)] transition-[background-color,box-shadow,transform] duration-150 ease-out-quart hover:bg-sheet hover:shadow-[var(--shadow-tile)] active:scale-[0.96] active:duration-75"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
