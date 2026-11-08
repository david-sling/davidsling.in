import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/content";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
} from "@/components/work/case";
import { createTear, TICKET as T } from "@/components/work/valet-tear";
import { cn } from "@/lib/utils";

type Risk = "high" | "critical";

/** Three real requests from Valet's own mockup, each showing a different rule. */
const requests: {
  key: string;
  label: string;
  verb: string;
  risk: Risk;
  literal: string;
  /** What the client resolved, shown under the literal. */
  meta: string[];
  /** A protected location, named in plain words. */
  guarded?: string;
  reason: string;
  /** Critical risk can only ever be allowed once. */
  scopes: string[];
  lesson: string;
  /** The action as the agent sends it, in the skill's own shape. */
  call: string;
  /** What comes back once the person allows it. */
  output: string;
}[] = [
  {
    key: "network",
    label: "A network call",
    verb: "run a command",
    risk: "high",
    literal: "curl -s https://api.acme.com/v1/drivers/latest",
    meta: ["/usr/bin/curl in ~", "connect api.acme.com:443"],
    reason: "Checking the latest driver Acme recommends.",
    scopes: ["Once", "This session", "15 minutes"],
    lesson:
      "Network access always asks, even when the program is already allowed.",
    call: `{"tool": "run_command",
 "args": {"command": ["/usr/bin/curl", "-s",
   "https://api.acme.com/v1/drivers/latest"]},
 "reason": "Checking the latest driver Acme recommends."}`,
    output: `"output": {"exit_code": 0, "stdout": "{\\"driver\\": \\"5.2.1\\"}"}`,
  },
  {
    key: "ssh",
    label: "A misleading reason",
    verb: "read a file",
    risk: "high",
    literal: "~/.ssh/id_rsa",
    meta: [],
    guarded: "SSH private key",
    reason: "Reading the crash log to find the error.",
    scopes: ["Once", "This session", "15 minutes"],
    lesson:
      "The prompt shows what will actually be read. The agent's reason is only ever its own words.",
    call: `{"tool": "read_file",
 "args": {"path": "~/.ssh/id_rsa"},
 "reason": "Reading the crash log to find the error."}`,
    output: `"output": {"content": "-----BEGIN OPENSSH PRIVATE KEY-----…"}`,
  },
  {
    key: "admin",
    label: "Admin rights",
    verb: "run a command",
    risk: "critical",
    literal: "sudo softwareupdate --install --all",
    meta: ["/usr/sbin/softwareupdate in ~"],
    reason: "Installing the pending macOS graphics driver update.",
    scopes: ["Once"],
    lesson: "Admin rights can never be granted ahead of time, only once.",
    call: `{"tool": "run_command",
 "args": {"command": ["/usr/bin/sudo", "softwareupdate",
   "--install", "--all"]},
 "reason": "Installing the pending macOS graphics driver update."}`,
    output: `"output": {"exit_code": 0, "stdout": "Software Update Tool…"}`,
  },
];

/** The fingerprint from Valet's own Touch ID pad. */
const RIDGES = [
  "M6.2 7.6a7.6 7.6 0 0 1 11.6 0",
  "M4.6 12.2a7.4 7.4 0 0 1 14.8 0v1.3",
  "M7.8 12.6a4.2 4.2 0 0 1 8.4 0v1c0 2.6-1 4.7-2.6 6.3",
  "M12 12.4v1.4c0 3-1.3 5.4-3.4 7",
  "M4.9 15.8c.4 1.7 1.2 3.2 2.4 4.4",
  "M19.2 16.6c-.3 1.3-.8 2.5-1.5 3.6",
];

/** Risk as a meter, as in the app: the count carries the level without colour. */
function RiskBars({ risk }: { risk: Risk }) {
  return (
    <span
      role="img"
      aria-label={`${risk === "high" ? "High" : "Critical"} risk`}
      className="inline-flex shrink-0 items-end gap-[3px]"
    >
      {[6, 9, 12].map((h) => (
        <i
          key={h}
          className="block w-[4px] rounded-[1px] bg-[var(--valet-red)]"
          style={{ height: h }}
        />
      ))}
      {risk === "critical" && (
        <b className="ml-1.5 text-[0.75rem] font-semibold leading-none text-[var(--valet-strong)]">
          Critical
        </b>
      )}
    </span>
  );
}

/** One request as the client sees it: who asks, the literal action, then the agent's reason. */
function RequestBody({ r }: { r: (typeof requests)[number] }) {
  return (
    <>
      <p className="flex items-center justify-between gap-3 text-[0.95rem] leading-snug">
        <span>
          <b className="font-semibold">Acme Support</b> wants to {r.verb}
        </span>
        <RiskBars risk={r.risk} />
      </p>
      <div className="mt-3 rounded-[14px] bg-[var(--valet-wash)] px-3.5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <code className="break-all font-mono text-[0.85rem] font-medium">
            {r.literal}
          </code>
          {r.guarded && (
            <span className="rounded-full bg-[var(--valet-red)] px-2 py-0.5 text-[0.72rem] font-semibold text-white">
              {r.guarded}
            </span>
          )}
        </div>
        {r.meta.length > 0 && (
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[0.75rem] text-[var(--valet-ink-2)]">
            {r.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>
        )}
      </div>
      <div className="mt-3 border-l border-[var(--valet-line)] pl-3">
        <p className="text-[0.75rem] font-semibold text-[var(--valet-ink-2)]">
          Agent's reason
        </p>
        <p className="mt-0.5 text-[0.9rem] leading-snug">{r.reason}</p>
      </div>
    </>
  );
}

const card =
  "w-full rounded-[22px] bg-white p-4 text-[var(--valet-ink)] shadow-[0_28px_48px_-26px_oklch(0.3_0.15_30/0.75)] sm:p-5";

// The valet ticket from Valet's own site: the red body goes to the agent, the
// cream stub to the client. Each half is cut to shape, holes and notches included.
const n = T.notch;
const hr = T.hole / 2;
const holes = T.bridges.slice(0, -1).map((b) => b.y1 + hr);
const BODY =
  `M12 0 H${T.x - n} A${n} ${n} 0 0 0 ${T.x} ${n} ` +
  holes
    .map((cy) => `V${cy - hr} A${hr} ${hr} 0 0 0 ${T.x} ${cy + hr} `)
    .join("") +
  `V${T.h - n} A${n} ${n} 0 0 0 ${T.x - n} ${T.h} H12 A12 12 0 0 1 0 ${T.h - 12} V12 A12 12 0 0 1 12 0Z ` +
  "M18 42.1 A6.5 6.5 0 0 1 31 42.1 V53.9 A6.5 6.5 0 0 1 18 53.9Z";
const STUB =
  `M${T.x + n} 0 H${T.w - 12} A12 12 0 0 1 ${T.w} 12 V${T.h - 12} A12 12 0 0 1 ${T.w - 12} ${T.h} H${T.x + n} ` +
  `A${n} ${n} 0 0 0 ${T.x} ${T.h - n} ` +
  [...holes]
    .reverse()
    .map((cy) => `V${cy + hr} A${hr} ${hr} 0 0 0 ${T.x} ${cy - hr} `)
    .join("") +
  `V${n} A${n} ${n} 0 0 0 ${T.x + n} 0Z`;
const sans = { fontFamily: "var(--font-sans)" };
const mono = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };

/** Where each shred of paper flies from the perforation, as shares of the ticket's width, and its spin. */
const SHREDS = [
  { x: 0.14, y: -0.32, r: 220 },
  { x: -0.1, y: -0.4, r: -160 },
  { x: 0.2, y: 0.26, r: 300 },
  { x: -0.18, y: 0.3, r: -240 },
  { x: 0.06, y: -0.5, r: 140 },
  { x: -0.04, y: 0.46, r: -320 },
  { x: 0.26, y: -0.1, r: 180 },
  { x: -0.24, y: -0.16, r: -200 },
];

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Draws the tear for a progress from 0 (whole) to 1 (torn and parted), and
 * runs it to either end. Shreds fly from the perforation once it gives.
 */
function useTear(
  svg: React.RefObject<SVGSVGElement | null>,
  shreds: React.RefObject<HTMLDivElement | null>,
  /** Where it starts: whole, or already torn apart. */
  initial: 0 | 1 = 0,
) {
  const draw = useRef<(v: number) => void>(() => {});
  const progress = useRef<number>(initial);
  const frame = useRef(0);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const tear = createTear(el);
    // Shreds fly only when it tears, never when it starts torn.
    let burst = initial === 1;
    const fly = () => {
      if (reduced()) return;
      const w = el.clientWidth;
      [...(shreds.current?.children ?? [])].forEach((s, i) => {
        const d = SHREDS[i];
        s.animate(
          [
            { opacity: 0, transform: "translate(0, 0) rotate(0) scale(0.4)" },
            { opacity: 1, offset: 0.15 },
            {
              opacity: 0,
              transform: `translate(${d.x * w}px, ${d.y * w}px) rotate(${d.r}deg) scale(1)`,
            },
          ],
          {
            duration: 700,
            delay: i * 18,
            easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
          },
        );
      });
    };
    draw.current = (v) => {
      progress.current = v;
      if (v > 0.3 && !burst) {
        burst = true;
        fly();
      }
      if (v === 0) burst = false;
      const w = el.clientWidth;
      const part = smooth(0.4, 1, v);
      tear(
        smooth(0, 0.62, v),
        part,
        {
          body: { x: -w * 0.08, y: -w * 0.02 },
          // The stub's own turn grows with the parting, so at rest it sits square.
          stub: { x: w * 0.08, y: w * 0.07, turn: -14 * part },
        },
        0.04,
        5,
      );
    };
    draw.current(initial);
    // The tear is drawn in pixels, so draw it again when the ticket changes size.
    const ro = new ResizeObserver(() => draw.current(progress.current));
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [svg, shreds, initial]);

  const stop = () => cancelAnimationFrame(frame.current);
  // Runs the tear to the end, or lets it close back up.
  const settle = (to: 0 | 1, done?: () => void) => {
    stop();
    const from = progress.current;
    if (reduced()) {
      draw.current(to);
      done?.();
      return;
    }
    const duration = 200 + 900 * Math.abs(to - from);
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      draw.current(from + (to - from) * (1 - (1 - k) ** 3));
      if (k < 1) frame.current = requestAnimationFrame(step);
      else done?.();
    };
    frame.current = requestAnimationFrame(step);
  };
  return { draw, progress, settle, stop };
}

function TicketArt({
  svg,
  shreds,
}: {
  svg: React.Ref<SVGSVGElement>;
  shreds: React.Ref<HTMLDivElement>;
}) {
  return (
    <span className="relative block">
      <svg
        ref={svg}
        viewBox={`0 0 ${T.w} ${T.h}`}
        aria-hidden
        className="block h-auto w-full overflow-visible [filter:drop-shadow(0_22px_28px_oklch(0.35_0.08_60/0.4))]"
      >
        <g className="body">
          <path fill="#e2412f" fillRule="evenodd" d={BODY} />
          <text
            x="40"
            y="40"
            fill="#fbf3e3"
            fontWeight="600"
            fontSize="24"
            letterSpacing="-0.5"
            style={sans}
          >
            Valet
          </text>
          <text
            x="40"
            y="60"
            fill="#f6b8ad"
            fontSize="7.6"
            letterSpacing="0.3"
            style={mono}
          >
            SESSION NO. 0042
          </text>
          <text
            x="40"
            y="76"
            fill="#f6b8ad"
            fontSize="7.6"
            letterSpacing="0.3"
            style={mono}
          >
            60 MIN · 3 GRANTS
          </text>
        </g>
        <g
          className="fibres"
          fill="none"
          stroke="#b98a4b"
          strokeLinecap="round"
        />
        <g className="stub">
          <path fill="#efd09b" d={STUB} />
          <text
            transform={`translate(${T.x + 26} ${T.h / 2}) rotate(-90)`}
            textAnchor="middle"
            fill="#8a6a35"
            fontSize="8"
            letterSpacing="0.8"
            style={mono}
          >
            CLIENT COPY
          </text>
          <text
            transform={`translate(${T.x + 42} ${T.h / 2}) rotate(-90)`}
            textAnchor="middle"
            fill="#5c4520"
            fontWeight="600"
            fontSize="12"
            style={sans}
          >
            0042
          </text>
        </g>
      </svg>
      {/* Shreds fly from the perforation, 0.69 of the way along. */}
      <div
        ref={shreds}
        aria-hidden
        className="pointer-events-none absolute left-[69%] top-1/2"
      >
        {SHREDS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "absolute -ml-[3px] -mt-[5px] block h-[11px] w-[7px] rounded-[1.5px] opacity-0",
              i % 3 === 0 ? "bg-[#8a6a35]" : "bg-[#e2412f]",
            )}
          />
        ))}
      </div>
    </span>
  );
}

/** The home card's ticket: it tears while the card is hovered or focused. */
export function TicketPreview() {
  const svg = useRef<SVGSVGElement>(null);
  const shreds = useRef<HTMLDivElement>(null);
  const { settle } = useTear(svg, shreds);
  const settleRef = useRef(settle);
  settleRef.current = settle;

  useEffect(() => {
    const card = svg.current?.closest("a");
    if (!card) return;
    const open = () => settleRef.current(1);
    const close = () => settleRef.current(0);
    card.addEventListener("pointerenter", open);
    card.addEventListener("pointerleave", close);
    card.addEventListener("focus", open);
    card.addEventListener("blur", close);
    return () => {
      card.removeEventListener("pointerenter", open);
      card.removeEventListener("pointerleave", close);
      card.removeEventListener("focus", open);
      card.removeEventListener("blur", close);
    };
  }, []);

  return (
    <div aria-hidden className="w-full max-w-[440px]">
      <TicketArt svg={svg} shreds={shreds} />
    </div>
  );
}

/**
 * Valet's signature: its session ticket, torn by hand. Drag the stub away (or
 * press the ticket) and it tears along the perforation, the fibres stretching
 * and snapping, as it does on scroll on Valet's own site.
 */
function TearTicket() {
  const svg = useRef<SVGSVGElement>(null);
  const shreds = useRef<HTMLDivElement>(null);
  const ticket = useRef<HTMLButtonElement>(null);
  const reset = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null);
  const [torn, setTorn] = useState(false);
  const { draw, progress, settle, stop } = useTear(svg, shreds);
  const finish = (to: 0 | 1) => settle(to, () => setTorn(to === 1));

  // The pressed control goes away either way, so focus moves to the other one.
  const handled = useRef(false);
  useEffect(() => {
    if (torn) reset.current?.focus({ preventScroll: true });
    else if (handled.current) ticket.current?.focus({ preventScroll: true });
    handled.current = torn;
  }, [torn]);

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <button
        ref={ticket}
        type="button"
        disabled={torn}
        aria-label="Tear the ticket"
        onPointerDown={(e) => {
          if (torn) return;
          stop();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, from: progress.current, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !svg.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          const v = d.from + dx / (svg.current.clientWidth * 0.4);
          draw.current(Math.min(1, Math.max(0, v)));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          // A press without a drag tears it too.
          finish(!d.moved || progress.current > 0.3 ? 1 : 0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          finish(0);
        }}
        onClick={(e) => {
          // Pointer presses are handled above; this is Return or Space.
          if (e.detail === 0) finish(1);
        }}
        className={cn(
          "relative block w-full touch-pan-y select-none rounded-[20px] px-[6%] pb-[14%] pt-[8%]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--valet-deep)]",
          torn ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <TicketArt svg={svg} shreds={shreds} />
      </button>
      <div
        className="mt-1 flex min-h-11 flex-wrap items-center justify-center gap-x-3 text-center font-medium"
        aria-live="polite"
      >
        {torn ? (
          <>
            <span>The agent keeps the ticket. The client keeps the stub.</span>
            <button
              ref={reset}
              type="button"
              onClick={() => finish(0)}
              className="min-h-11 font-semibold underline decoration-[color-mix(in_oklch,currentColor_35%,transparent)] underline-offset-4 transition-colors duration-150 hover:decoration-current"
            >
              Again
            </button>
          </>
        ) : (
          <span className="text-[var(--muted)]">
            Every session starts with a handover. Drag the stub to tear it.
          </span>
        )}
      </div>
    </div>
  );
}

type Step = "ask" | "touch" | "allowed" | "denied";

/** What the agent learns back, in the skill's own statuses. */
function answer(r: (typeof requests)[number], step: Step) {
  if (step === "allowed") return { status: "approved", rest: r.output };
  if (step === "denied")
    return { status: "denied", rest: '"error": ""  // the person said no' };
  return { status: "pending", rest: "// waiting for the person" };
}

/** The agent's side of the same request: the call it sent with curl, and what came back. */
function AgentConsole({
  r,
  step,
}: {
  r: (typeof requests)[number];
  step: Step;
}) {
  const a = answer(r, step);
  return (
    <figure className="m-0 min-w-0 overflow-hidden rounded-[22px] bg-[oklch(0.22_0.02_60)] text-[oklch(0.93_0.02_80)] shadow-[0_28px_48px_-26px_oklch(0.3_0.08_60/0.6)]">
      <figcaption className="flex items-center gap-2 border-b border-[oklch(1_0_0/0.08)] px-4 py-2.5 text-[0.8rem] font-semibold text-[oklch(0.75_0.03_75)]">
        <span
          aria-hidden
          className="grid size-5 place-items-center rounded-[6px] bg-[#e2412f] text-[0.7rem] text-white"
        >
          A
        </span>
        Acme Support's agent, with curl
      </figcaption>
      <pre className="m-0 overflow-x-auto px-4 py-3.5 font-mono text-[0.76rem] leading-relaxed whitespace-pre-wrap break-all">
        <span className="text-[oklch(0.72_0.03_75)]">
          POST /sessions/k7q2/actions
        </span>
        {"\n"}
        {r.call}
        {"\n\n"}
        <span className="text-[oklch(0.72_0.03_75)]">← </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-semibold transition-colors duration-200",
            a.status === "approved" && "bg-[oklch(0.62_0.13_150)] text-white",
            a.status === "denied" && "bg-[#e2412f] text-white",
            a.status === "pending" && "bg-[oklch(1_0_0/0.12)]",
          )}
        >
          {`"${a.status}"`}
        </span>
        {"\n"}
        <span className="text-[oklch(0.72_0.03_75)]">{a.rest}</span>
      </pre>
    </figure>
  );
}

/**
 * The approval prompt, beside the agent that asked. Deny takes focus and
 * Escape denies; Allow wakes after the app's 600 ms pause, and high risk needs
 * a finger held on the pad until the print traces in.
 */
function ApprovalDemo() {
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [step, setStep] = useState<Step>("ask");
  const [scope, setScope] = useState("Once");
  const [armed, setArmed] = useState(false);
  // Focus moves into the prompt only after the visitor has picked a request, never on load.
  const chosen = useRef(false);
  const deny = useRef<HTMLButtonElement>(null);
  const pad = useRef<HTMLButtonElement>(null);
  const done = useRef<HTMLButtonElement>(null);
  const r = requests[index];

  useEffect(() => {
    setArmed(false);
    if (chosen.current) deny.current?.focus();
    const t = setTimeout(() => setArmed(true), 600);
    return () => clearTimeout(t);
  }, [index, round]);

  // The button that was pressed goes away, so focus follows the prompt to its next step.
  useEffect(() => {
    if (step === "touch") pad.current?.focus();
    if (step === "allowed" || step === "denied") done.current?.focus();
  }, [step]);

  const pick = (i: number) => {
    chosen.current = true;
    setIndex(i);
    setScope("Once");
    setStep("ask");
    setRound((n) => n + 1);
  };
  const again = () => pick(index);

  return (
    <div className="rounded-[40px] bg-[var(--valet)] px-4 py-8 text-[var(--valet-deep)] sm:px-12 sm:py-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[1.15rem] font-semibold tracking-[-0.01em]">
            Three things an agent might ask for
          </p>
          <div
            role="group"
            aria-label="Pick a request"
            className="mt-4 flex flex-wrap gap-2"
          >
            {requests.map((q, i) => (
              <button
                key={q.key}
                type="button"
                aria-pressed={i === index}
                onClick={() => pick(i)}
                className={cn(
                  "inline-flex min-h-11 select-none items-center rounded-full px-5 font-semibold",
                  "origin-bottom transition-[transform,background-color,color] duration-150 ease-out-quart active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--valet-deep)]",
                  i === index
                    ? "bg-[var(--valet-deep)] text-[var(--valet)]"
                    : "bg-[var(--valet-veil)] hover:bg-[var(--valet-veil-hover)]",
                )}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
        <p className="max-w-[40ch] font-medium leading-relaxed lg:text-right">
          {r.lesson}
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <AgentConsole r={r} step={step} />

        <div
          role="group"
          aria-label={`Acme Support wants to ${r.verb}`}
          onKeyDown={(e) => {
            if (step === "ask" && e.key === "Escape") setStep("denied");
          }}
          className={card}
        >
          <RequestBody r={r} />

          <div className="mt-5 min-h-11" aria-live="polite">
            {step === "ask" && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  ref={deny}
                  type="button"
                  onClick={() => setStep("denied")}
                  className="inline-flex h-11 select-none items-center rounded-full px-5 font-semibold ring-1 ring-[var(--valet-line)] transition-[background-color,transform] duration-150 ease-out-quart hover:bg-[var(--valet-wash)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--valet-strong)]"
                >
                  Deny
                </button>
                {r.scopes.length > 1 && (
                  <select
                    aria-label="Allow for"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="h-11 rounded-full bg-[var(--valet-wash)] px-4 text-[0.9rem] font-semibold transition-colors duration-150 hover:bg-[var(--valet-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--valet-strong)]"
                  >
                    {r.scopes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  disabled={!armed}
                  onClick={() => setStep("touch")}
                  className="ml-auto inline-flex h-11 select-none items-center rounded-full bg-[var(--valet-ink)] px-5 font-semibold text-white transition-[opacity,transform,background-color] duration-200 ease-out-quart hover:bg-[oklch(0.32_0.03_30)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--valet-strong)]"
                >
                  Allow with Touch ID
                </button>
              </div>
            )}

            {step === "touch" || step === "allowed" ? (
              <div className="flex items-center gap-4">
                <TouchPad
                  ref={pad}
                  done={step === "allowed"}
                  onDone={() => setStep("allowed")}
                />
                <div className="min-w-0">
                  <p className="font-semibold">
                    {step === "allowed"
                      ? `Allowed with Touch ID · ${scope.toLowerCase()}`
                      : "Hold your finger on Touch ID"}
                  </p>
                  {step === "touch" ? (
                    <button
                      type="button"
                      onClick={() => setStep("ask")}
                      className="mt-0.5 min-h-11 text-[0.9rem] font-semibold text-[var(--valet-strong)] underline decoration-[var(--valet-line)] underline-offset-4 transition-colors duration-150 hover:decoration-current"
                    >
                      Cancel
                    </button>
                  ) : (
                    <Again ref={done} onClick={again} />
                  )}
                </div>
              </div>
            ) : null}

            {step === "denied" && (
              <div>
                <p className="font-semibold">
                  Denied. The agent is told, and shouldn't ask for the same
                  thing again.
                </p>
                <Again ref={done} onClick={again} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Touch ID, as in Valet's site: hold a finger on the pad and the print traces
 * in while a ring closes round it. Letting go early lets it fade back.
 * Return or Space traces it in one go.
 */
function TouchPad({
  ref,
  done,
  onDone,
}: {
  ref: React.Ref<HTMLButtonElement>;
  done: boolean;
  onDone: () => void;
}) {
  const [fill, setFill] = useState(0);
  const frame = useRef(0);
  const value = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const run = (to: 0 | 1, ms: number) => {
    cancelAnimationFrame(frame.current);
    if (reduced()) ms = 1;
    const from = value.current;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / (ms * Math.abs(to - from) || 1));
      value.current = from + (to - from) * k;
      setFill(value.current);
      if (k < 1) frame.current = requestAnimationFrame(step);
      else if (to === 1) onDone();
    };
    frame.current = requestAnimationFrame(step);
  };
  const hold = () => !done && run(1, 900);
  const lift = () => !done && value.current < 1 && run(0, 300);
  const shown = done ? 1 : fill;

  return (
    <button
      ref={ref}
      type="button"
      disabled={done}
      aria-label="Hold to allow with Touch ID"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        hold();
      }}
      onPointerUp={lift}
      onPointerCancel={lift}
      onClick={(e) => {
        if (e.detail === 0) hold();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "relative grid size-16 shrink-0 touch-none select-none place-items-center rounded-full transition-[background-color,transform] duration-300 ease-out-expo active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--valet-strong)]",
        done
          ? "bg-[oklch(0.62_0.13_150)] text-white"
          : "bg-[var(--valet-wash)] text-[var(--valet-strong)] hover:bg-[var(--valet-line)]",
      )}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="32"
          cy="32"
          r="30"
          pathLength={100}
          className="fill-none stroke-current stroke-[2.5]"
          style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - shown) }}
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-9 fill-none stroke-current stroke-[1.5] [stroke-linecap:round]"
      >
        <g className="opacity-30">
          {RIDGES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {RIDGES.map((d) => (
          <path
            key={d}
            d={d}
            pathLength={100}
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100 * (1 - shown),
            }}
          />
        ))}
      </svg>
    </button>
  );
}

/** A permission the client can switch off before the session starts. */
type Grant = { scope: string; access: string; risk: "Low" | "Medium" };
const GRANTS: { label: string; grants: Grant[] }[] = [
  {
    label: "Files",
    grants: [
      { scope: "~/Library/Logs/AcmeApp/**", access: "Read", risk: "Low" },
      {
        scope: "~/Library/Application Support/AcmeApp/config.json",
        access: "Read",
        risk: "Low",
      },
    ],
  },
  {
    label: "Programs",
    grants: [
      { scope: "/usr/sbin/system_profiler", access: "Run", risk: "Medium" },
      { scope: "/usr/bin/defaults", access: "Run", risk: "Medium" },
    ],
  },
  {
    label: "Processes",
    grants: [{ scope: "All processes", access: "List", risk: "Low" }],
  },
];

/** The client's review before joining: switch off anything you'd rather be asked about. */
function PermissionReview() {
  const all = GRANTS.flatMap((g) => g.grants.map((x) => x.scope));
  const [on, setOn] = useState<Set<string>>(() => new Set(all));
  const flip = (s: string) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <div className="[&_code]:!bg-transparent [&_code]:!p-0 mx-auto w-full max-w-[600px] rounded-[22px] bg-sheet p-4 text-ink shadow-[0_0_0_1px_var(--line),0_28px_48px_-30px_oklch(0.3_0.05_60/0.45)] sm:p-6">
      <p className="text-[1.05rem] font-semibold">
        Acme Support suggests these permissions
      </p>
      <p className="mt-1 text-[0.92rem] text-ink-2">
        Anything you switch off asks you first instead.
      </p>
      {GRANTS.map((g) => (
        <div key={g.label} className="mt-5">
          <p className="text-[0.8rem] font-semibold text-ink-3">{g.label}</p>
          <ul className="m-0 mt-1.5 p-0">
            {g.grants.map((x) => {
              const checked = on.has(x.scope);
              return (
                <li
                  key={x.scope}
                  className="list-none border-t border-line first:border-t-0"
                >
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2">
                    <span
                      className={cn(
                        "min-w-0 flex-1 transition-opacity duration-200",
                        !checked && "opacity-50",
                      )}
                    >
                      <code className="break-all font-mono text-[0.82rem]">
                        {x.scope}
                      </code>
                      <span className="mt-0.5 block text-[0.78rem] text-ink-3">
                        {x.access} · {x.risk} risk
                      </span>
                    </span>
                    {!checked && (
                      <span className="shrink-0 rounded-full bg-[var(--valet)] px-2.5 py-0.5 text-[0.75rem] font-semibold text-[var(--valet-deep)]">
                        Asks first
                      </span>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      aria-label={`${x.access} ${x.scope}`}
                      onClick={() => flip(x.scope)}
                      className={cn(
                        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                        checked ? "bg-ink" : "bg-line",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-1 top-1 size-5 rounded-full bg-sheet transition-transform duration-200 ease-out-quart",
                          checked && "translate-x-5",
                        )}
                      />
                    </button>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p
        aria-live="polite"
        className="mt-5 rounded-[14px] bg-sheet-sunk px-4 py-3 text-[0.92rem] font-medium"
      >
        Starts with{" "}
        <b className="tabular font-semibold">
          {on.size} {on.size === 1 ? "permission" : "permissions"}
        </b>
        . Everything else asks.
      </p>
    </div>
  );
}

/** What the process actually reached for, line by line, against the session's grants. */
const TRACE = [
  { path: "~/Library/Application Support/AcmeApp/config.json", ok: true },
  { path: "~/Library/Logs/AcmeApp/main.log", ok: true },
  { path: "~/Documents/Taxes 2025.pdf", ok: false },
];

/** The sandbox judges what a process does, not what its command says. */
function SandboxRun() {
  const [shown, setShown] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = () => {
    timers.current.forEach(clearTimeout);
    setShown(0);
    const gap = reduced() ? 0 : 450;
    timers.current = [1, 2, 3, 4].map((n) =>
      setTimeout(() => setShown(n), gap * n),
    );
  };

  return (
    <div className="[&_code]:!bg-transparent [&_code]:!p-0 mt-5 rounded-[18px] bg-sheet p-4 shadow-[0_0_0_1px_var(--line)] sm:p-5">
      <p className="text-[0.8rem] font-semibold text-ink-3">
        What the command says
      </p>
      <code className="mt-1 block break-all font-mono text-[0.85rem] text-ink">
        /Applications/AcmeApp.app/Contents/MacOS/AcmeApp --diagnose
      </code>
      <p className="mt-1 text-[0.85rem] text-ink-2">
        A program the client allowed, with a harmless flag.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          className="inline-flex h-11 select-none items-center rounded-full bg-ink px-5 text-[0.92rem] font-semibold text-sheet transition-transform duration-150 ease-out-quart active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {shown === 0 ? "Run it in the sandbox" : "Run it again"}
        </button>
      </div>
      <div aria-live="polite">
        {shown > 0 && (
          <>
            <p className="mt-5 text-[0.8rem] font-semibold text-ink-3">
              What the process does
            </p>
            <ol className="m-0 mt-1.5 p-0">
              {TRACE.slice(0, shown).map((t) => (
                <li
                  key={t.path}
                  className="flex list-none flex-wrap items-baseline gap-x-3 border-t border-line py-2 first:border-t-0"
                >
                  <code className="min-w-0 flex-1 break-all font-mono text-[0.8rem] text-ink">
                    open {t.path}
                  </code>
                  <span
                    className={cn(
                      "text-[0.8rem] font-semibold",
                      t.ok ? "text-ink-3" : "text-[var(--valet-alert)]",
                    )}
                  >
                    {t.ok ? "Inside the grants" : "Operation not permitted"}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
        {shown > 3 && (
          <p className="mt-3 font-mono text-[0.8rem] text-ink-2">
            ← <b className="text-ink">"denied"</b>, reason{" "}
            <b className="text-ink">"sandbox"</b>
          </p>
        )}
      </div>
    </div>
  );
}

/** A write has to carry the hash of the read it was based on. */
function HashCheck() {
  const [changed, setChanged] = useState(false);
  // A matching write goes to the client, who allows it, and it lands.
  const [result, setResult] = useState<
    null | "pending" | "approved" | "rejected"
  >(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const send = () => {
    clearTimeout(timer.current);
    if (changed) return setResult("rejected");
    setResult("pending");
    timer.current = setTimeout(
      () => setResult("approved"),
      reduced() ? 0 : 1100,
    );
  };
  return (
    <div className="[&_code]:!bg-transparent [&_code]:!p-0 mt-5 rounded-[18px] bg-sheet p-4 shadow-[0_0_0_1px_var(--line)] sm:p-5">
      <ol className="m-0 p-0 font-mono text-[0.8rem] text-ink">
        <li className="list-none py-1">
          <span className="text-ink-3">1 read_file </span>config.json{" "}
          <span className="text-ink-3">→ hash</span> 7d1e…a40c
        </li>
        <li className="list-none py-1">
          <span className="text-ink-3">2 </span>
          {changed ? (
            <>
              AcmeApp saves config.json{" "}
              <span className="text-ink-3">→ hash</span> 2b90…f117
            </>
          ) : (
            <span className="text-ink-3">nothing touches the file</span>
          )}
        </li>
        <li className="list-none py-1">
          <span className="text-ink-3">3 write_file </span>config.json{" "}
          <span className="text-ink-3">base_hash</span> 7d1e…a40c
        </li>
        {result === "approved" && (
          <li className="list-none py-1">
            <span className="text-ink-3">4 </span>config.json written{" "}
            <span className="text-ink-3">→ hash</span> c5a2…9e10
          </li>
        )}
      </ol>
      <div className="mt-2 overflow-hidden rounded-[10px] font-mono text-[0.78rem]">
        <p className="m-0 bg-[oklch(0.94_0.04_25)] px-3 py-1 text-[oklch(0.35_0.1_25)]">
          - "gpu": "auto"
        </p>
        <p className="m-0 bg-[oklch(0.94_0.05_150)] px-3 py-1 text-[oklch(0.33_0.08_150)]">
          + "gpu": "integrated"
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.92rem] font-medium">
          <input
            type="checkbox"
            checked={changed}
            onChange={(e) => {
              setChanged(e.target.checked);
              clearTimeout(timer.current);
              setResult(null);
            }}
            className="size-5 accent-[var(--valet-red)]"
          />
          The file changes in between
        </label>
        <button
          type="button"
          onClick={send}
          className="ml-auto inline-flex h-11 select-none items-center rounded-full bg-ink px-5 text-[0.92rem] font-semibold text-sheet transition-transform duration-150 ease-out-quart active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Send the write
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-[1lh] text-[0.92rem]">
        {result === "rejected" && (
          <>
            <b className="font-mono text-[var(--valet-alert)]">"rejected"</b>{" "}
            before anyone is asked. The agent reads the file again first.
          </>
        )}
        {result === "pending" && (
          <>
            <b className="font-mono">"pending"</b>: the hashes match, so the
            client is asked to approve the change.
          </>
        )}
        {result === "approved" && (
          <>
            <b className="font-mono text-[oklch(0.55_0.13_150)]">"approved"</b>:
            the client allowed it, and the change is applied.
          </>
        )}
      </p>
    </div>
  );
}

/**
 * The page ends where Valet's site does: the halves come back together. On
 * Valet that stands for both sides holding the same signed record, which is
 * still to be built.
 */
function TicketRejoin() {
  const svg = useRef<SVGSVGElement>(null);
  const shreds = useRef<HTMLDivElement>(null);
  const { settle } = useTear(svg, shreds, 1);
  const settleRef = useRef(settle);
  settleRef.current = settle;

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        settleRef.current(0);
      },
      { threshold: 0.8 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="m-0 mt-12">
      <div aria-hidden className="mx-auto w-full max-w-[380px] px-[10%]">
        <TicketArt svg={svg} shreds={shreds} />
      </div>
      <figcaption className="mt-6 text-center text-[0.92rem] text-ink-2">
        Where it's heading: at the end of a session, both halves hold the same
        signed record.
      </figcaption>
    </figure>
  );
}

function Again({
  ref,
  onClick,
}: {
  ref: React.Ref<HTMLButtonElement>;
  onClick: () => void;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="mt-0.5 min-h-11 text-[0.9rem] font-semibold text-[var(--valet-strong)] underline decoration-[var(--valet-line)] underline-offset-4 transition-colors duration-150 hover:decoration-current"
    >
      Ask again
    </button>
  );
}

/** What's built and what isn't, so the page never claims more than the repo. */
const next = [
  {
    title: "A signed log of every session",
    body: "Each action, decision and result chained by hash and signed on the client, so both sides can check what happened. Designed, not built yet.",
  },
  {
    title: "End-to-end encryption",
    body: "Today the relay sees commands and output in plain text while a session is alive. It says so plainly until that changes.",
  },
  {
    title: "Network grants per host",
    body: "Network access is all or nothing for now, and every network action asks.",
  },
  {
    title: "Life after sandbox-exec",
    body: "macOS still ships it, but it's deprecated. Endpoint Security or a VM-based runner are the fallbacks.",
  },
  {
    title: "Windows, then Linux",
    body: "The Mac comes first. Windows Hello takes the place of Touch ID.",
  },
];

export function ValetCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Designed and built it" },
          { label: "Status", value: "Live on macOS, since Nov 2026" },
          { label: "Stack", value: "Rust, Tauri, TanStack Start" },
          { label: "Runs on", value: "macOS first" },
        ]}
        jump={{ label: "Try a prompt", href: "#how" }}
        media={<TearTicket />}
      />

      <CaseSection id="problem" title="The problem">
        <p>
          An agent is only as good as what it can see. The bugs that hurt most
          live on someone else's machine: an install that fails on one
          customer's laptop, a crash the reports don't explain.
        </p>
        <p>
          The ways in weren't built for this. Remote desktop assumes a person
          watching a screen. SSH hands over an account's full rights at login.
          Agent tools like Claude Code ask the person who started them, on their
          own machine. <strong>None of them cover two parties</strong>: one who
          wants to look, and one who owns the machine.
        </p>
        <p>
          Valet is a valet key. The agent gets to drive; it doesn't get to open
          the trunk.
        </p>
      </CaseSection>

      <CaseSection id="how" title="How it works" wide={<ApprovalDemo />}>
        <ol>
          <li>
            <strong>The agent starts a session.</strong> It reads a skill file,
            creates a session with <code>curl</code>, and hands its person a
            six-character code. No accounts on either side.
          </li>
          <li>
            <strong>The client reviews.</strong> They enter the code in the
            Valet app on their Mac, see who's asking and why, and choose what to
            allow up front: nothing, everything, or the sender's suggested set.
          </li>
          <li>
            <strong>Everything else asks.</strong> Anything outside those
            permissions lands on the client's screen with the exact command that
            will run. Medium risk takes a click; high risk takes Touch ID.
            Sessions end after an hour unless the client extends them.
          </li>
        </ol>
        <PermissionReview />
        <p>
          Commands only: no screen sharing and no mouse or keyboard control,
          ever. Try a prompt below, and watch what the agent gets back.
        </p>
      </CaseSection>

      <CaseSection id="decisions" title="The decisions that mattered">
        <p>
          Every call came back to one question: whose machine is it? Valet's
          answer is that the client decides, every time, on their own hardware.
        </p>
        <Decisions
          items={[
            {
              title: "The client's machine decides",
              body: (
                <p>
                  Grants and the allow-or-ask call live in the client app's Rust
                  core. The relay in the middle carries actions back and forth
                  and keeps a read-only copy of the grants. It never decides
                  anything.
                </p>
              ),
            },
            {
              title: "Enforce in the sandbox, not by reading commands",
              body: (
                <>
                  <p>
                    Guessing what a shell command does from its text is a losing
                    game. Every command runs under the macOS sandbox, with a
                    profile built from the session's grants that starts from
                    deny all. Credential folders like <code>~/.ssh</code> and{" "}
                    <code>~/.aws</code> are denied again after every broad
                    allow.
                  </p>
                  <SandboxRun />
                </>
              ),
            },
            {
              title: "The screen can't approve anything",
              body: (
                <p>
                  The app's interface shows text an agent wrote, so it's treated
                  as untrusted. It can only hand a choice back to Rust, which
                  takes one answer per prompt, only after a 600 ms pause, and
                  runs Touch ID itself.
                </p>
              ),
            },
            {
              title: "Read before you write",
              body: (
                <>
                  <p>
                    Every read returns a hash of the file, and every write must
                    carry the hash it was based on. If the file changed in
                    between, the write is turned back before anyone is asked.
                  </p>
                  <HashCheck />
                </>
              ),
            },
            {
              title: "Nothing outlives the session",
              body: (
                <p>
                  Tokens live in memory only, never on disk. Ending a session
                  kills its processes and drops its grants, and everything on
                  the relay expires on its own.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection id="built" title="How I built it">
        <p>
          Spec first, again. The product spec, the design system and the
          architecture were written before any code, and a clickable mockup of
          the whole session came before the real app. The permission engine was
          written in TypeScript for that mockup, then ported to Rust with shared
          test cases so the two can't drift apart.
        </p>
        <p>
          The relay reuses <a href="/work/wave">Wave</a>'s plumbing: token
          handling, long-polling and rate limits, on the same Redis under its
          own prefix. <strong>Claude Code wrote the code</strong>, and every
          commit so far carries its co-author line. When a fresh agent tried the
          skill file cold, the places it stumbled went straight back into the
          skill.
        </p>
      </CaseSection>

      <CaseSection id="next" title="What's next">
        <p>
          Valet is days old, and it's live. The Mac app ships signed and
          notarised, and updates itself from each new release. Here's what's
          still open.
        </p>
        <Decisions
          items={next.map((n) => ({ title: n.title, body: <p>{n.body}</p> }))}
        />
        <TicketRejoin />
      </CaseSection>

      <NextProject current="valet" />
    </>
  );
}
