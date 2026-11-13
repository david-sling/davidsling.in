import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { TextMorph } from "torph/react";
import {
  ArrowUpRight,
  Bot,
  Check,
  CreditCard,
  Database,
  KeyRound,
  Laptop,
  LogIn,
  MessagesSquare,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TextQuote,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { siGithub, siRedis } from "simple-icons";
import { SlideArrow } from "@/components/button";
import { CommitCount } from "@/components/commit-count";
import type { CommitRepo } from "@/lib/commits";
import { Explain } from "@/components/work/cmd-facts";
import { onField } from "@/components/work/case";
import { projects, site, type ProjectSlug } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * /ai-infrastructure: Wave, Valet and cmd-facts as one line of work.
 * The page opens on a question, "Who's on the other side?", and the answer
 * picks the tool. Everything after it explains how the three connect.
 */

type Side = "agent" | "person";

const project = (slug: ProjectSlug) => projects.find((p) => p.slug === slug)!;
const live = (slug: ProjectSlug) => project(slug).links[0].href;

const sides: {
  id: Side;
  label: string;
  slug: "wave" | "valet";
  icon: LucideIcon;
  /** Shown instead of the label where the two options can't share a phone's width. */
  short?: string;
}[] = [
  { id: "agent", label: "Another agent", slug: "wave", icon: Bot },
  {
    id: "person",
    label: "A person, no agent",
    short: "Just a person",
    slug: "valet",
    icon: UserRound,
  },
];

/** What each tool carries: messages, a key to someone's machine, a plain sentence. */
const toolIcon: Record<string, LucideIcon> = {
  wave: MessagesSquare,
  valet: KeyRound,
  "cmd-facts": TextQuote,
};

function Brand({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("fill-current", className)}>
      <path d={path} />
    </svg>
  );
}

const h2 =
  "text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]";

/* ───────────────────────── First viewport ───────────────────────── */

export function InfraHero() {
  const [side, setSide] = useState<Side>("agent");
  const reduce = useReducedMotion();
  const shown = sides.find((s) => s.id === side)!;

  return (
    <section
      aria-labelledby="infra-title"
      className="mx-auto grid max-w-[1240px] gap-3 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="flex flex-col rounded-[40px] bg-sheet px-6 py-8 sm:px-10 sm:py-12">
        <h1
          id="infra-title"
          className="text-[clamp(2.6rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.04em]"
        >
          I build infrastructure for AI.
        </h1>
        <p className="mt-5 max-w-[30ch] text-[clamp(1.05rem,1.6vw,1.3rem)] font-medium leading-snug text-ink-2">
          Tools for people who work with agents all day. Each one starts from
          the same question.
        </p>

        <fieldset className="m-0 mt-12 min-w-0 border-0 p-0 lg:mt-auto lg:pt-12">
          <legend className="p-0 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Who's on the other side?
          </legend>
          <div className="mt-4 grid w-full max-w-[26rem] grid-cols-2 rounded-full bg-sheet-sunk p-1.5 shadow-[inset_0_0_0_1px_var(--line)]">
            {sides.map((s) => {
              const on = s.id === side;
              return (
                <label
                  key={s.id}
                  className="relative flex min-h-12 cursor-pointer select-none items-center justify-center rounded-full px-2 text-center text-[0.88rem] font-semibold leading-tight transition-transform duration-150 ease-out-quart active:scale-[0.97] active:duration-75 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-blue-strong sm:px-4 sm:text-[0.95rem]"
                >
                  <input
                    type="radio"
                    name="other-side"
                    value={s.id}
                    checked={on}
                    onChange={() => setSide(s.id)}
                    className="sr-only"
                  />
                  {on && (
                    <motion.span
                      layoutId="side-thumb"
                      aria-hidden
                      className="absolute inset-0 rounded-full transition-colors duration-300"
                      style={{ background: `var(--${s.slug})` }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 480, damping: 40 }
                      }
                    />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex items-center gap-2 transition-colors duration-200",
                      on ? "text-[var(--on)]" : "text-ink-2 hover:text-ink",
                    )}
                    style={{ "--on": `var(--${s.slug}-deep)` } as React.CSSProperties}
                  >
                    <s.icon
                      aria-hidden
                      className="size-4 shrink-0"
                      strokeWidth={2.25}
                    />
                    {s.short ? (
                      <>
                        <span className="max-[419px]:hidden">{s.label}</span>
                        <span aria-hidden className="min-[420px]:hidden">
                          {s.short}
                        </span>
                      </>
                    ) : (
                      s.label
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <p role="status" className="sr-only">
          Showing {project(shown.slug).name}
        </p>
      </div>

      <Stage side={side} />
    </section>
  );
}

const lines: Record<Side, string> = {
  agent:
    "Agent to agent. Paste one prompt into each and they're in the same channel, while you read along.",
  person:
    "Agent to a machine with no agent. The agent asks, and the person who owns the machine decides.",
};

const MORPH = 420;

/**
 * One stage, not two: the field, mark, name, line, far end of the wire and
 * buttons each change in place when the answer changes. Only the panel in
 * the middle swaps, and both panels share a cell so the height never moves.
 */
function Stage({ side }: { side: Side }) {
  const slug = side === "agent" ? "wave" : "valet";
  const p = project(slug);
  const swap = (on: boolean) =>
    cn(
      "col-start-1 row-start-1 transition-[opacity,transform] ease-out-expo",
      on
        ? "opacity-100 delay-75 duration-300"
        : "scale-50 -rotate-12 opacity-0 duration-150",
    );
  const end =
    "inline-flex shrink-0 items-center gap-2 rounded-full bg-[oklch(1_0_0/0.6)] px-3.5 py-2 text-[0.88rem] font-semibold";
  const press =
    "inline-flex h-12 select-none items-center gap-2 rounded-full pl-6 pr-5 font-semibold no-underline origin-bottom transition-[transform,background-color,color] duration-150 ease-out-quart active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75";

  return (
    <div className="relative grid overflow-hidden rounded-[40px]">
      {sides.map((s) => (
        <div
          key={s.id}
          aria-hidden
          className={cn(
            "col-start-1 row-start-1 transition-opacity ease-out-expo",
            s.id === side ? "opacity-100 duration-500" : "opacity-0 duration-300",
          )}
          style={{ background: `var(--${s.slug})` }}
        />
      ))}
      <div
        className="relative col-start-1 row-start-1 flex flex-col px-6 py-8 transition-colors duration-300 sm:px-10 sm:py-10"
        style={
          {
            ...onField(slug),
            "--deep": `var(--${slug}-deep)`,
            "--field": `var(--${slug})`,
          } as React.CSSProperties
        }
      >
        <h2 className="flex items-center gap-3 text-[clamp(2.2rem,4vw,3.25rem)] font-semibold leading-none tracking-[-0.04em]">
          {/* The marks share their field's hue, so they sit on a white tile. */}
          <span
            aria-hidden
            data-motion="travel"
            className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-white shadow-[0_8px_18px_-10px_var(--deep)]"
          >
            {sides.map((s) => (
              <img
                key={s.id}
                src={project(s.slug).logo}
                alt=""
                width={36}
                height={36}
                className={cn("size-9", swap(s.id === side))}
              />
            ))}
          </span>
          <TextMorph as="span" duration={MORPH}>
            {p.name}
          </TextMorph>
        </h2>
        {/* A wrapping sentence can't morph letter by letter, so the two lines trade places in one cell. */}
        <div className="mt-3 grid max-w-[38ch] text-[clamp(1.05rem,1.5vw,1.25rem)] font-medium leading-snug">
          {sides.map((s) => (
            <p
              key={s.id}
              aria-hidden={s.id !== side}
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,filter] ease-out-expo",
                s.id === side
                  ? "opacity-100 delay-100 duration-500"
                  : "opacity-0 blur-[4px] duration-150",
              )}
            >
              {lines[s.id]}
            </p>
          ))}
        </div>

        {/* Two ends and what travels between them. */}
        <div className="mt-8 flex items-center gap-2.5">
          <span className={end}>
            <Bot aria-hidden className="size-4" strokeWidth={2.25} />
            Your agent
          </span>
          <span
            aria-hidden
            className="relative h-3 min-w-6 flex-1 [container-type:inline-size]"
          >
            <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-current opacity-35" />
            <span className="absolute left-0 top-[1px] size-2.5 animate-[wire-travel_2.6s_var(--ease-quart)_infinite] rounded-full bg-current motion-reduce:hidden" />
            {/* Agents answer back; a machine with no agent only gets asked. */}
            <span
              className={cn(
                "absolute left-0 top-[1px] size-2.5 animate-[wire-travel_2.6s_var(--ease-quart)_1.3s_infinite_reverse_both] rounded-full bg-current transition-opacity duration-300 motion-reduce:hidden",
                side === "agent" ? "opacity-100" : "opacity-0",
              )}
            />
          </span>
          <span className={end}>
            <span aria-hidden data-motion="travel" className="grid size-4">
              <Bot
                className={cn("size-4", swap(side === "agent"))}
                strokeWidth={2.25}
              />
              <Laptop
                className={cn("size-4", swap(side === "person"))}
                strokeWidth={2.25}
              />
            </span>
            <TextMorph as="span" duration={MORPH} className="whitespace-nowrap">
              {side === "agent" ? "Their agent" : "Their Mac"}
            </TextMorph>
          </span>
        </div>

        <div className="mt-4 grid">
          {sides.map((s) => {
            const on = s.id === side;
            return (
              <div
                key={s.id}
                inert={!on}
                className={cn(
                  "col-start-1 row-start-1 transition-[opacity,filter] ease-out-expo",
                  on
                    ? "opacity-100 delay-100 duration-500"
                    : "pointer-events-none opacity-0 blur-[6px] duration-150 max-lg:hidden",
                )}
              >
                {s.id === "agent" ? <WaveChannel /> : <ValetPrompt />}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5 lg:mt-auto lg:pt-8">
          <a
            href={live(slug)}
            target="_blank"
            rel="noreferrer"
            data-motion="travel"
            className={cn(
              press,
              "group/out bg-[var(--deep)] text-[var(--field)] hover:bg-[color-mix(in_oklch,var(--deep)_86%,var(--field))]",
            )}
          >
            <TextMorph as="span" duration={MORPH} className="whitespace-nowrap">
              {`Open ${p.name}`}
            </TextMorph>
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-300 ease-out-expo group-hover/out:-translate-y-0.5 group-hover/out:translate-x-0.5"
            />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <Link
            to="/work/$slug"
            params={{ slug }}
            data-motion="travel"
            className={cn(
              press,
              "group/link bg-[oklch(1_0_0/0.5)] hover:bg-[oklch(1_0_0/0.8)]",
            )}
          >
            Case study
            <SlideArrow />
          </Link>
        </div>
      </div>
    </div>
  );
}

const thread: { who: string; text: string; human?: boolean }[] = [
  {
    who: "Mac agent",
    text: "The engine's export schema changed. Pull and rebuild your bindings?",
  },
  { who: "Windows agent", text: "Rebuilt. Two tests fail on path separators." },
  {
    who: "David",
    text: "Normalise paths in the engine, not the bindings.",
    human: true,
  },
];

function WaveChannel() {
  return (
    <figure className="m-0 rounded-[24px] bg-sheet p-4 text-ink shadow-[var(--shadow-tile)] sm:p-5">
      <figcaption className="flex items-baseline justify-between gap-4 text-[0.82rem] font-medium text-ink-3">
        <span>An example channel</span>
        <span>2 agents, 1 human</span>
      </figcaption>
      <ul className="m-0 mt-3 grid gap-3 p-0">
        {thread.map((m) => (
          <li key={m.who} className="flex list-none gap-3">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-[0.82rem] font-semibold",
                m.human
                  ? "bg-blue text-[oklch(0.21_0.014_245)]"
                  : "bg-sheet-sunk text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]",
              )}
            >
              {m.human ? (
                <UserRound className="size-4" strokeWidth={2.25} />
              ) : (
                <Bot className="size-4" strokeWidth={2.25} />
              )}
            </span>
            <p className="min-w-0 leading-snug">
              <span className="block text-[0.82rem] font-semibold text-ink-2">
                {m.who}
              </span>
              {m.text}
            </p>
          </li>
        ))}
      </ul>
    </figure>
  );
}

// Short enough to stay on one line in the prompt at phone width.
const ASK = "rm -rf ~/.cache/acme";

function ValetPrompt() {
  const [answer, setAnswer] = useState<"allowed" | "denied" | null>(null);
  const again = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answer) again.current?.focus({ preventScroll: true });
  }, [answer]);

  const press =
    "inline-flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-full border-0 px-5 font-[inherit] text-[0.95rem] font-semibold origin-bottom transition-[transform,background-color] duration-150 ease-out-quart active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75";
  const veil =
    "bg-[oklch(1_0_0/0.5)] text-[var(--valet-deep)] hover:bg-[oklch(1_0_0/0.8)]";

  return (
    <div className="text-[var(--valet-deep)]">
      <p className="text-[0.88rem] font-semibold text-[color-mix(in_oklch,var(--valet-deep)_72%,var(--valet))]">
        What the owner is asked
      </p>
      <Explain line={ASK} compact preview className="mt-2" />
      <div className="mt-3 flex min-h-11 flex-wrap items-center gap-2">
        {answer ? (
          <>
            <p role="status" className="mr-auto flex items-center gap-2 font-semibold">
              {answer === "allowed" ? (
                <Check aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
              ) : (
                <X aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
              )}
              {answer === "allowed"
                ? "Allowed. It runs in a sandbox on their Mac."
                : "Denied. Nothing ran, and the agent was told no."}
            </p>
            <button
              ref={again}
              type="button"
              data-motion="travel"
              onClick={() => setAnswer(null)}
              className={cn(press, veil)}
            >
              <RotateCcw aria-hidden className="size-4" />
              Ask again
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              data-motion="travel"
              onClick={() => setAnswer("denied")}
              className={cn(press, veil)}
            >
              Deny
            </button>
            <button
              type="button"
              data-motion="travel"
              onClick={() => setAnswer("allowed")}
              className={cn(
                press,
                "bg-[var(--valet-deep)] text-[var(--valet)] hover:bg-[color-mix(in_oklch,var(--valet-deep)_86%,var(--valet))]",
              )}
            >
              Allow
            </button>
            <Link
              to="/work/$slug"
              params={{ slug: "cmd-facts" }}
              className="group/link ml-auto inline-flex min-h-11 items-center justify-between gap-2 rounded-full bg-[var(--cmd-facts)] px-4 max-sm:w-full text-[0.88rem] font-semibold text-[var(--cmd-facts-deep)] no-underline transition-transform duration-150 ease-out-quart active:scale-[0.97] active:duration-75"
            >
              The sentence is cmd-facts
              <SlideArrow />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── One need led to the next ───────────────────── */

const chain: {
  slug: ProjectSlug;
  need: string;
  body: React.ReactNode;
}[] = [
  {
    slug: "wave",
    need: "I was the message bus",
    body: (
      <>
        I had Claude Code running on a Mac and on a Windows laptop, both
        building against the same Rust engine. I was copying schemas out of one
        terminal and pasting them into the other. So I gave the agents a
        channel.
      </>
    ),
  },
  {
    slug: "valet",
    need: "Then the other side had no agent",
    body: (
      <>
        Wave needs an agent at both ends. The bugs that hurt most live on
        someone else's machine, where there's only a person. Valet lets an
        agent run commands there, and the machine's owner decides what it's
        allowed to do. Its relay reuses Wave's plumbing: token handling,
        long-polling and rate limits.
      </>
    ),
  },
  {
    slug: "cmd-facts",
    need: "Then the owner had to read a command",
    body: (
      <>
        Valet ends at an approval prompt that shows the exact command. That's
        honest, and no help if you've never opened a terminal. cmd-facts turns
        the command into structured facts and one plain sentence. It's a
        library, because that reader is everywhere, not only in Valet.
      </>
    ),
  },
];

export function Chain() {
  return (
    <section
      aria-labelledby="chain-title"
      className="mx-auto grid max-w-[1240px] gap-10 px-4 pt-28 sm:px-6 sm:pt-36 lg:grid-cols-[1fr_1.6fr]"
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <h2 id="chain-title" className={h2}>
          One need led to the next
        </h2>
        <p className="mt-4 max-w-[34ch] text-ink-2">
          None of these was planned as a set. Each one exists because the one
          before it needed it.
        </p>
      </div>
      <ol className="relative m-0 p-0 before:absolute before:bottom-10 before:left-[17px] before:top-10 before:w-px before:bg-line">
        {chain.map((c) => {
          const p = project(c.slug);
          const Icon = toolIcon[c.slug];
          return (
            <li
              key={c.slug}
              className="group/row relative list-none border-t border-line py-8 pl-14 last:border-b"
            >
              <span
                aria-hidden
                data-motion="travel"
                className="absolute left-0 top-[1.9rem] grid size-9 place-items-center rounded-full outline-4 outline-ground transition-transform duration-300 ease-out-expo group-hover/row:-rotate-6 group-hover/row:scale-110"
                style={{
                  background: `var(--${c.slug})`,
                  color: `var(--${c.slug}-deep)`,
                }}
              >
                <Icon className="size-[18px]" strokeWidth={2.25} />
              </span>
              <h3 className="text-[1.6rem] font-semibold tracking-[-0.02em]">
                {c.need}
              </h3>
              <p className="mt-3 max-w-[60ch] text-[1.08rem] leading-[1.65] text-ink-2">
                {c.body}
              </p>
              <Link
                to="/work/$slug"
                params={{ slug: c.slug }}
                className="group/link -ml-4 mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold no-underline transition-colors duration-150 hover:bg-sheet hover:text-[var(--accent)]"
                style={
                  { "--accent": `var(--${c.slug}-text)` } as React.CSSProperties
                }
              >
                {p.name} case study
                <SlideArrow />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ───────────────────────── One foundation ───────────────────────── */

const tools: { slug: ProjectSlug; line: string }[] = [
  { slug: "wave", line: "Agent to agent" },
  { slug: "valet", line: "Agent to a machine" },
  { slug: "cmd-facts", line: "A library, no server. Valet's Mac app imports it." },
];

const layers: {
  name: string;
  note: string;
  icon: React.ReactNode;
  live?: boolean;
}[] = [
  {
    name: "Redis",
    note: "One instance. Each tool keeps to its own key prefix.",
    icon: <Brand path={siRedis.path} className="size-5" />,
    live: true,
  },
  {
    name: "Sign-in",
    note: "The same account for every tool.",
    icon: <LogIn aria-hidden className="size-5" strokeWidth={2.25} />,
  },
  {
    name: "Database",
    note: "One place for what outlives a session.",
    icon: <Database aria-hidden className="size-5" strokeWidth={2.25} />,
  },
  {
    name: "Billing",
    note: "One bill across the tools.",
    icon: <CreditCard aria-hidden className="size-5" strokeWidth={2.25} />,
  },
];

export function Foundation() {
  const [planned, setPlanned] = useState(false);
  const reduce = useReducedMotion();
  const views = [
    { id: false, label: "Today" },
    { id: true, label: "Where it's going" },
  ];

  const bar = (on: boolean) =>
    cn(
      "relative isolate rounded-[20px] px-5 py-4",
      "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:border-2 before:border-dashed before:border-line before:transition-opacity before:duration-300",
      "after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-sheet after:shadow-[var(--shadow-tile)] after:transition-opacity after:duration-300",
      on
        ? "before:opacity-0 after:opacity-100"
        : "before:opacity-100 after:opacity-0",
    );

  return (
    <section
      aria-labelledby="foundation-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-10">
        <h2 id="foundation-title" className={h2}>
          One foundation under all of it
        </h2>
        <div className="max-w-[64ch] text-[1.08rem] leading-[1.65] text-ink-2">
          <p>
            Wave and Valet already run on the same Redis, each under its own
            key prefix. That's the first shared piece, not the last.
          </p>
          <p className="mt-[1.1em]">
            Next they share a database, sign-in and billing, so{" "}
            <strong className="font-semibold text-ink">
              one account opens every tool I build
            </strong>
            . That part is planned, not built.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <div
          role="group"
          aria-label="Which stage to show"
          className="inline-grid grid-cols-2 rounded-full bg-sheet-sunk p-1.5 shadow-[inset_0_0_0_1px_var(--line)]"
        >
          {views.map((v) => {
            const on = v.id === planned;
            return (
              <button
                key={v.label}
                type="button"
                aria-pressed={on}
                onClick={() => setPlanned(v.id)}
                className="relative min-h-11 cursor-pointer select-none rounded-full border-0 bg-transparent px-4 font-[inherit] text-[0.92rem] font-semibold transition-transform duration-150 ease-out-quart active:scale-[0.97] active:duration-75 sm:px-5"
              >
                {on && (
                  <motion.span
                    layoutId="stage-thumb"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 480, damping: 40 }
                    }
                  />
                )}
                <span
                  className={cn(
                    "relative transition-colors duration-200",
                    on ? "text-sheet" : "text-ink-2",
                  )}
                >
                  {v.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className={cn(bar(planned), "lg:col-span-2")}>
            <p className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <span className="flex items-center gap-2.5 text-[1.15rem] font-semibold tracking-[-0.01em]">
                <UserRound aria-hidden className="size-5 text-ink-2" strokeWidth={2.25} />
                One account
              </span>
              <Status live={false} />
            </p>
          </div>

          {tools.map((t, i) => {
            const p = project(t.slug);
            return (
              <Link
                key={t.slug}
                to="/work/$slug"
                params={{ slug: t.slug }}
                data-motion="travel"
                className={cn(
                  "group/link flex min-h-[9.5rem] flex-col justify-between rounded-[28px] p-5 no-underline transition-transform duration-300 ease-out-expo hover:-translate-y-1 active:scale-[0.985] active:duration-75",
                  i === 0 && "lg:col-start-1",
                  // On one column the library goes below the shared layers: it doesn't sit on them.
                  t.slug === "cmd-facts" && "max-lg:order-last max-lg:mt-6",
                )}
                style={
                  {
                    background: `var(--${t.slug})`,
                    ...onField(t.slug),
                  } as React.CSSProperties
                }
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-[1.6rem] font-semibold leading-none tracking-[-0.02em]">
                    <ToolIcon slug={t.slug} />
                    {p.name}
                  </span>
                  <SlideArrow />
                </span>
                <span className="mt-6 max-w-[24ch] font-medium leading-snug">
                  {t.line}
                </span>
                <span className="sr-only">(read the case study)</span>
              </Link>
            );
          })}

          {layers.map((l) => (
            <div
              key={l.name}
              className={cn(bar(l.live || planned), "lg:col-span-2 lg:col-start-1")}
            >
              <p className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="flex items-center gap-2.5 text-[1.15rem] font-semibold tracking-[-0.01em]">
                  <span className="text-ink-2">{l.icon}</span>
                  {l.name}
                </span>
                <Status live={!!l.live} />
              </p>
              <p className="relative mt-1 pl-[1.875rem] text-[0.95rem] text-ink-2">
                {l.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolIcon({ slug }: { slug: ProjectSlug }) {
  const Icon = toolIcon[slug];
  return <Icon aria-hidden className="size-[1em] max-h-6 max-w-6 shrink-0" strokeWidth={2.25} />;
}

function Status({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold",
        live
          ? "bg-blue text-[oklch(0.21_0.014_245)]"
          : "text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]",
      )}
    >
      {live ? "Shared today" : "Planned"}
    </span>
  );
}

/* ───────────────────────── Build and guard ───────────────────────── */

const ledger: { slug: CommitRepo; guard: string }[] = [
  {
    slug: "wave",
    guard:
      "Every request carries a 256-bit token. Only its SHA-256 hash is stored, and it's compared in constant time.",
  },
  {
    slug: "valet",
    guard:
      "Every command runs under a macOS sandbox profile that starts from deny all. The allow-or-ask call is made in Rust, on the owner's machine.",
  },
  {
    slug: "cmd-facts",
    guard:
      "No model at run time. Every fact is written by hand, and the writing rules run as tests.",
  },
];

export function Principle() {
  const big =
    "text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.04em] [text-wrap:balance]";
  return (
    <section
      aria-labelledby="principle-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex min-h-[19rem] flex-col justify-between gap-10 rounded-[40px] bg-blue px-6 py-8 text-[oklch(0.21_0.014_245)] sm:px-12 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <h2 id="principle-title" className={big}>
              Build with AI.
            </h2>
            <Sparkles aria-hidden className="mt-1 size-10 shrink-0 sm:size-12" strokeWidth={1.75} />
          </div>
          <p className="max-w-[34ch] text-[1.15rem] font-medium leading-snug">
            Agents write most of the code in all three tools. I write the
            specs, review the diffs and make the calls an agent can't.
          </p>
        </div>
        <div className="flex min-h-[19rem] flex-col justify-between gap-10 rounded-[40px] bg-ink px-6 py-8 text-sheet sm:px-12 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <p className={big}>Guard without it.</p>
            <ShieldCheck aria-hidden className="mt-1 size-10 shrink-0 sm:size-12" strokeWidth={1.75} />
          </div>
          <p className="max-w-[36ch] text-[1.15rem] font-medium leading-snug">
            What decides whether something is allowed is never a model. It's a
            hash, a sandbox profile or a hand-written table: things that give
            the same answer every time.
          </p>
        </div>
      </div>
      <p className="mt-10 max-w-[34ch] text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em]">
        <span className="text-ink-3">
          Use AI to build, use deterministic systems to guard.
        </span>{" "}
        That's the safest way to build fast.
      </p>

      <ul className="m-0 mt-8 p-0">
        {ledger.map((row) => {
          const p = project(row.slug);
          return (
            <li
              key={row.slug}
              className="grid list-none gap-x-10 gap-y-4 border-t border-line py-7 last:border-b lg:grid-cols-[0.7fr_1fr_1.5fr]"
            >
              <h3 className="flex items-center gap-3 self-start text-[1.4rem] font-semibold tracking-[-0.02em]">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[1.05rem]"
                  style={{
                    background: `var(--${row.slug})`,
                    color: `var(--${row.slug}-deep)`,
                  }}
                >
                  <ToolIcon slug={row.slug} />
                </span>
                {p.name}
              </h3>
              <div>
                <p className="flex items-center gap-1.5 text-[0.82rem] font-medium text-ink-3">
                  <Bot aria-hidden className="size-3.5" strokeWidth={2.25} />
                  Agents wrote
                </p>
                <p className="mt-1 max-w-[36ch] text-ink-2">
                  <CommitCount repo={row.slug} /> carry a Claude co-author
                  line.
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[0.82rem] font-medium text-ink-3">
                  <ShieldCheck aria-hidden className="size-3.5" strokeWidth={2.25} />
                  What stands guard
                </p>
                <p className="mt-1 max-w-[52ch] font-medium text-ink">
                  {row.guard}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────────── Next ───────────────────────────── */

/** The three tools as tiles on a shelf, with empty places kept for the next ones. */
function Shelf() {
  const tilt = [-7, 5, -4, 6, -5];
  const tile =
    "grid size-12 shrink-0 place-items-center rounded-[16px] [transform:rotate(var(--tilt))] hover:animate-[sticker-wobble_0.6s_var(--ease-out)] sm:size-20 sm:rounded-[24px]";
  return (
    <ul
      aria-label="Three tools so far, with room for more"
      className="m-0 flex list-none gap-2.5 p-0 sm:gap-3"
    >
      {(["wave", "valet", "cmd-facts"] as const).map((slug, i) => {
        const Icon = toolIcon[slug];
        return (
          <li
            key={slug}
            data-motion="travel"
            className={cn(tile, "shadow-[var(--shadow-tile)]")}
            style={
              {
                "--tilt": `${tilt[i]}deg`,
                background: `var(--${slug})`,
                color: `var(--${slug}-deep)`,
              } as React.CSSProperties
            }
          >
            <Icon aria-hidden className="size-6 sm:size-9" strokeWidth={2} />
            <span className="sr-only">{project(slug).name}</span>
          </li>
        );
      })}
      {[3, 4].map((i) => (
        <li
          key={i}
          aria-hidden
          data-motion="travel"
          className={cn(
            tile,
            "border-2 border-dashed border-[color-mix(in_oklch,var(--ink)_30%,transparent)] text-ink-3",
          )}
          style={{ "--tilt": `${tilt[i]}deg` } as React.CSSProperties}
        >
          <Plus className="size-5 sm:size-7" strokeWidth={2} />
        </li>
      ))}
    </ul>
  );
}

export function Next() {
  const github = site.socials.find((s) => s.label === "GitHub")!;
  return (
    <section
      aria-labelledby="next-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <div className="grid gap-8 rounded-[40px] bg-blue-wash px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          <h2 id="next-title" className={h2}>
            More tools are coming
          </h2>
          <p className="mt-5 max-w-[40ch] text-[clamp(1.05rem,1.6vw,1.3rem)] font-medium leading-snug text-ink-2">
            I'm building more tooling for people who use AI heavily. The shared
            account comes first, and the next tools start from there.
          </p>
        </div>
        <div className="flex flex-col gap-10 lg:items-end lg:gap-14">
          <Shelf />
          <div className="flex flex-wrap gap-2.5 lg:justify-end">
          <a
            href={github.href}
            target="_blank"
            rel="noreferrer"
            data-motion="travel"
            className="group/out inline-flex h-12 select-none items-center gap-2 rounded-full bg-ink pl-6 pr-5 font-semibold text-sheet no-underline origin-bottom transition-[transform,background-color] duration-150 ease-out-quart hover:bg-[color-mix(in_oklch,var(--ink)_88%,var(--blue))] active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75"
          >
            <Brand path={siGithub.path} className="size-4" />
            Follow on GitHub
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-300 ease-out-expo group-hover/out:-translate-y-0.5 group-hover/out:translate-x-0.5"
            />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <Link
            to="/"
            hash="work"
            data-motion="travel"
            className="group/link inline-flex h-12 select-none items-center gap-2 rounded-full bg-sheet pl-6 pr-5 font-semibold no-underline shadow-[var(--shadow-tile)] origin-bottom transition-[transform,background-color] duration-150 ease-out-quart hover:bg-sheet-sunk active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75"
          >
            All work
            <SlideArrow />
          </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
