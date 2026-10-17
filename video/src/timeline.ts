// Precomputed, deterministic: finger path, slider values and the pendulum sim for every frame.
export type Key = "L1" | "L2" | "m1" | "m2" | "g";
export type Params = Record<Key, number>;
export type Part = "arm1" | "arm2" | "bob1" | "bob2" | "gravity";

export const FPS = 30;
export const VARS: { key: Key; label: string; unit: string; def: number; min: number; max: number }[] = [
  { key: "L1", label: "Arm 1 length", unit: "m", def: 2.5, min: 0.5, max: 5 },
  { key: "L2", label: "Arm 2 length", unit: "m", def: 1.8, min: 0.3, max: 4 },
  { key: "m1", label: "Bob 1 mass", unit: "kg", def: 2, min: 0.5, max: 5 },
  { key: "m2", label: "Bob 2 mass", unit: "kg", def: 1, min: 0.5, max: 5 },
  { key: "g", label: "Gravity", unit: "m/s²", def: 9.8, min: 1, max: 30 },
];
export const AFFECTS: Record<Key, Part> = { L1: "arm1", L2: "arm2", m1: "bob1", m2: "bob2", g: "gravity" };

// Layout (video px)
export const RENDER = { x: 40, y: 400, w: 1000, h: 860 };
export const PANEL = { x: 40, y: 1290, w: 1000, h: 380 };
const PAD = 44, GAP = 48, COL = (PANEL.w - PAD * 2 - GAP) / 2;
export const THUMB = 46;
export function sliderBox(i: number) {
  const row = Math.floor(i / 2), col = i % 2;
  const full = i === 4;
  const x = PANEL.x + PAD + (full ? 0 : col * (COL + GAP));
  const y = PANEL.y + 34 + row * 112;
  return { x, y, w: full ? PANEL.w - PAD * 2 : COL, trackY: y + 74 };
}
export function thumbX(i: number, v: number) {
  const b = sliderBox(i), d = VARS[i];
  return b.x + THUMB / 2 + ((v - d.min) / (d.max - d.min)) * (b.w - THUMB);
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const q = (v: number) => Math.round(v * 10) / 10;

type Frame = { p: Params; active: Key | null; fx: number; fy: number; down: boolean; fingerIn: number };
const frames: Frame[] = [];
let p: Params = Object.fromEntries(VARS.map((v) => [v.key, v.def])) as Params;
let fx = 980, fy = 2050, fingerIn = 0;
const push = (n: number, f: (t: number) => Partial<Frame>) => {
  for (let i = 0; i < n; i++) {
    const o = f(n === 1 ? 1 : i / (n - 1));
    if (o.p) p = o.p;
    fx = o.fx ?? fx; fy = o.fy ?? fy; fingerIn = o.fingerIn ?? fingerIn;
    frames.push({ p, active: o.active ?? null, fx, fy, down: o.down ?? false, fingerIn });
  }
};
const travel = (tx: number, ty: number, n: number) => {
  const sx = fx, sy = fy;
  push(n, (t) => ({ fx: lerp(sx, tx, ease(t)), fy: lerp(sy, ty, ease(t)), fingerIn: 1 }));
};
const drag = (key: Key, to: number, n: number, watch: number) => {
  const i = VARS.findIndex((v) => v.key === key);
  travel(thumbX(i, p[key]), sliderBox(i).trackY, 20);
  push(6, () => ({ active: key, down: true }));
  const from = p[key];
  push(n, (t) => {
    const v = q(lerp(from, to, ease(t)));
    return { active: key, down: true, p: { ...p, [key]: v }, fx: thumbX(i, lerp(from, to, ease(t))) };
  });
  push(10, () => ({ active: key, down: true }));
  // lift the finger slightly off the thumb while watching
  const sx = fx, sy = fy;
  push(watch, (t) => { const k = ease(Math.min(1, t * 3)); return { fx: sx + 20 * k, fy: sy + 50 * k, fingerIn: 1 - k }; });
};

push(24, () => ({}));
drag("L1", 4.6, 36, 52);
drag("L2", 3.4, 32, 52);
drag("m2", 4.5, 30, 48);
drag("g", 2.0, 34, 62);
drag("g", 24, 30, 60);
{ const sx = fx, sy = fy; push(22, (t) => ({ fx: lerp(sx, 1000, ease(t)), fy: lerp(sy, 2100, ease(t)), fingerIn: 1 - t })); }
push(30, () => ({}));
export const DURATION = frames.length;
export const frameAt = (f: number) => frames[Math.min(f, frames.length - 1)];

// ---- physics: the same RK4 and equations as the site's Pendulum ----
type State = [number, number, number, number];
function derive([t1, t2, w1, w2]: State, { L1, L2, m1, m2, g }: Params): State {
  const d = t1 - t2, den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
  const a1 = (-g * (2 * m1 + m2) * Math.sin(t1) - m2 * g * Math.sin(t1 - 2 * t2) - 2 * Math.sin(d) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) / (L1 * den);
  const a2 = (2 * Math.sin(d) * (w1 * w1 * L1 * (m1 + m2) + g * (m1 + m2) * Math.cos(t1) + w2 * w2 * L2 * m2 * Math.cos(d))) / (L2 * den);
  return [w1, w2, a1, a2];
}
function rk4(s: State, h: number, pp: Params): State {
  const add = (a: State, b: State, k: number) => a.map((v, i) => v + b[i] * k) as State;
  const k1 = derive(s, pp), k2 = derive(add(s, k1, h / 2), pp), k3 = derive(add(s, k2, h / 2), pp), k4 = derive(add(s, k3, h), pp);
  return s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) as State;
}
const tick = (s: State, pp: Params) => {
  const n = Math.max(4, Math.ceil(4 * Math.sqrt(pp.g / Math.min(pp.L1, pp.L2))));
  for (let i = 0; i < n; i++) s = rk4(s, 1 / (60 * n), pp);
  return s;
};

// Sim in 60 Hz ticks (two per video frame), trail stored as angles + the params they were drawn with.
export const TRAIL = 260;
export const ticks: { s: State; p: Params }[] = [];
export const sim: { end: number; reset: number }[] = [];
{
  let s: State = [2.2, 2.6, 0, 0];
  let reset = 0, prev: Params | null = null;
  for (let i = 0; i < 120; i++) { s = tick(s, frames[0].p); ticks.push({ s, p: frames[0].p }); }
  for (const fr of frames) {
    if (prev && prev !== fr.p && VARS.some((v) => prev![v.key] !== fr.p[v.key])) reset = ticks.length;
    prev = fr.p;
    for (let k = 0; k < 2; k++) { s = tick(s, fr.p); ticks.push({ s, p: fr.p }); }
    sim.push({ end: ticks.length, reset });
  }
}
