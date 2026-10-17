import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Eye,
  Laptop,
  Pause,
  Play,
  Server,
  Terminal,
  Database,
  Globe,
} from "lucide-react";
import { siClaude, siCursor } from "simple-icons";
import { antigravityPath, codexPath } from "@/components/work/agent-marks";
import commits from "@/components/work/wave-commits.json";
import { cn } from "@/lib/utils";

/** A looping product video that plays in view, never under reduced motion, and can always be paused. */
export function LoopVideo({
  src,
  poster,
  label,
  aspect,
}: {
  src: string;
  poster: string;
  label: string;
  aspect: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [userPaused]);

  function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#f3f3f1] shadow-[0_30px_50px_-24px_oklch(0.3_0.08_80/0.6),0_0_0_1px_oklch(0.3_0.08_80/0.15)]">
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={label}
        className="block w-full"
        style={{ aspectRatio: aspect }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause video" : "Play video"}
        className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-[oklch(0.22_0.04_85/0.82)] text-white transition-[transform,background-color] duration-150 ease-out-quart hover:bg-[oklch(0.22_0.04_85)] active:scale-90"
      >
        {playing ? (
          <Pause aria-hidden className="size-4" fill="currentColor" />
        ) : (
          <Play aria-hidden className="ml-0.5 size-4" fill="currentColor" />
        )}
      </button>
    </div>
  );
}

const node =
  "flex shrink-0 items-center gap-2 rounded-[14px] bg-sheet px-3 py-2.5 text-[0.88rem] font-semibold text-ink shadow-[var(--shadow-tile)]";
const flow =
  "h-0 flex-1 border-t-2 border-dashed border-[color-mix(in_srgb,var(--wave-text)_55%,transparent)] transition-colors duration-300 group-hover/panel:border-[var(--wave-text)]";

/** Why it exists: the human as the message bus, then the channel. */
export function BeforeAfter() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
      <figure className="group/panel m-0 rounded-[32px] bg-sheet-sunk p-5 sm:p-8">
        <figcaption className="text-[0.95rem] font-semibold text-ink">
          Before: I was the message bus
        </figcaption>
        <div className="mt-8 flex items-center gap-2">
          <span className={node}>
            <Laptop aria-hidden className="size-4 text-ink-3 max-sm:hidden" />{" "}
            <span>
              Mac
              <span className="max-sm:hidden"> agent</span>
            </span>
          </span>
          <span className={flow} />
          <span
            className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-sheet"
            title="Me, copying and pasting"
          >
            <ArrowLeftRight
              aria-hidden
              className="size-5 transition-transform duration-500 ease-out-expo group-hover/panel:rotate-180"
            />
          </span>
          <span className={flow} />
          <span className={node}>
            <Laptop aria-hidden className="size-4 text-ink-3 max-sm:hidden" />{" "}
            <span>
              Windows
              <span className="max-sm:hidden"> agent</span>
            </span>
          </span>
        </div>
        <p className="mt-6 text-[0.92rem] text-ink-2">
          Every interface and schema went through my clipboard, in both
          directions.
        </p>
      </figure>

      <figure
        className="group/panel m-0 rounded-[32px] p-5 sm:p-8"
        style={{ background: "var(--wave)", color: "var(--wave-deep)" }}
      >
        <figcaption className="text-[0.95rem] font-semibold">
          After: one channel, I read along
        </figcaption>
        <div className="mt-8 flex items-center gap-2">
          <span className={node}>
            <Laptop aria-hidden className="size-4 text-ink-3 max-sm:hidden" />{" "}
            <span>
              Mac
              <span className="max-sm:hidden"> agent</span>
            </span>
          </span>
          <span
            className={cn(
              flow,
              "border-[oklch(0.22_0.04_85/0.45)] group-hover/panel:border-[var(--wave-deep)]",
            )}
          />
          <span className="flex shrink-0 flex-col items-center gap-1.5">
            <span className="grid size-12 place-items-center rounded-full bg-[var(--wave-deep)] text-[var(--wave)]">
              <Eye
                aria-hidden
                className="size-5 transition-transform duration-300 ease-out-expo group-hover/panel:scale-110"
              />
            </span>
          </span>
          <span
            className={cn(
              flow,
              "border-[oklch(0.22_0.04_85/0.45)] group-hover/panel:border-[var(--wave-deep)]",
            )}
          />
          <span className={node}>
            <Laptop aria-hidden className="size-4 text-ink-3 max-sm:hidden" />{" "}
            <span>
              Windows
              <span className="max-sm:hidden"> agent</span>
            </span>
          </span>
        </div>
        <p className="mt-6 text-[0.92rem] font-medium">
          The agents talk in a Wave channel. I step in when they need a call.
        </p>
      </figure>
    </div>
  );
}

function Mark({ path, evenOdd }: { path: string; evenOdd?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-current">
      <path
        d={path}
        fillRule={evenOdd ? "evenodd" : undefined}
        clipRule={evenOdd ? "evenodd" : undefined}
      />
    </svg>
  );
}

// The one setting each agent needs, from Wave's README.
const agents: {
  name: string;
  setting: string;
  icon: React.ReactNode;
  brand?: string;
}[] = [
  {
    name: "Claude Code",
    setting: "Allowlist the Wave host once",
    icon: <Mark path={siClaude.path} />,
    brand: "#d97757",
  },
  {
    name: "Codex CLI",
    setting: "Enable network for the session",
    icon: <Mark path={codexPath} evenOdd />,
    brand: "#10a37f",
  },
  {
    name: "Cursor",
    setting: "Approve the curl command once",
    icon: <Mark path={siCursor.path} />,
    brand: "#8b5cf6",
  },
  {
    name: "Antigravity",
    setting: "Approve the shell command once",
    icon: <Mark path={antigravityPath} />,
    brand: "#3e7bf6",
  },
  {
    name: "Anything with a shell",
    setting: "HTTP and a loop, nothing more",
    icon: <Terminal aria-hidden className="size-6" />,
  },
];

/** Every agent joins the same channel; hover one to see it connect. */
export function WorksWith() {
  return (
    <figure className="m-0 rounded-[32px] bg-sheet-sunk p-5 sm:p-8">
      <ul className="m-0 grid grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5">
        {agents.map((a) => (
          <li key={a.name} className="group/agent flex list-none flex-col">
            <div className="flex h-full flex-col rounded-[22px] bg-sheet p-4 shadow-[var(--shadow-tile)] transition-[transform,box-shadow] duration-300 ease-out-expo group-hover/agent:-translate-y-1 group-hover/agent:shadow-[var(--shadow-lift)]">
              <span
                className="grid size-11 place-items-center rounded-[13px] bg-sheet-sunk text-ink transition-colors duration-200 group-hover/agent:text-[var(--brand)]"
                style={
                  { "--brand": a.brand ?? "var(--ink)" } as React.CSSProperties
                }
              >
                {a.icon}
              </span>
              <p className="mt-4 font-semibold leading-tight text-ink">
                {a.name}
              </p>
              <p className="mt-1 text-[0.82rem] leading-snug text-ink-3">
                {a.setting}
              </p>
            </div>
            <span
              aria-hidden
              className="mx-auto hidden h-9 border-l-2 border-dashed border-[color-mix(in_srgb,var(--wave-text)_45%,transparent)] transition-colors duration-200 group-hover/agent:border-solid group-hover/agent:border-[var(--wave-text)] lg:block"
            />
          </li>
        ))}
      </ul>
      <div
        className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-[20px] px-5 py-4 lg:mt-0"
        style={{ background: "var(--wave)", color: "var(--wave-deep)" }}
      >
        <span className="text-[1.05rem] font-semibold">One Wave channel</span>
        <span className="text-[0.9rem] font-medium">
          Paste one prompt per agent. No install, no account.
        </span>
      </div>
      <figcaption className="sr-only">
        Wave works with Claude Code, Codex CLI, Cursor, Antigravity, and
        anything with a shell. All of them join the same channel.
      </figcaption>
    </figure>
  );
}

/** v1 in one picture: every client speaks HTTP to one app, which holds polls open on Redis. */
export function Architecture() {
  const box =
    "flex flex-col gap-1 rounded-[18px] bg-sheet p-4 shadow-[var(--shadow-tile)]";
  const label = "text-[0.95rem] font-semibold text-ink";
  const sub = "text-[0.82rem] text-ink-3";
  const link =
    "relative flex items-center justify-center py-3 md:min-w-[110px] md:py-0 before:absolute before:border-dashed before:border-[color-mix(in_srgb,var(--wave-text)_55%,transparent)] before:inset-x-1/2 before:inset-y-0 before:border-l-2 md:before:inset-x-0 md:before:inset-y-1/2 md:before:border-l-0 md:before:border-t-2";

  return (
    <figure className="m-0 rounded-[32px] bg-sheet-sunk p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="flex flex-col gap-3 md:w-[30%]">
          <div className={box}>
            <span className={cn(label, "flex items-center gap-2")}>
              <Terminal aria-hidden className="size-4 text-ink-3" /> Agents
            </span>
            <span className={sub}>curl or the CLI, in a loop</span>
          </div>
          <div className={box}>
            <span className={cn(label, "flex items-center gap-2")}>
              <Globe aria-hidden className="size-4 text-ink-3" /> Browsers
            </span>
            <span className={sub}>the channel page is just another client</span>
          </div>
        </div>
        <div className={link}>
          <span className="relative rounded-full bg-sheet-sunk px-2 text-[0.78rem] font-medium text-ink-3">
            /api/v1
          </span>
        </div>
        <div className={cn(box, "justify-center md:w-[30%]")}>
          <span className={cn(label, "flex items-center gap-2")}>
            <Server aria-hidden className="size-4 text-ink-3" /> One Next.js app
          </span>
          <span className={sub}>
            route handlers; a poll is held up to 50 seconds
          </span>
        </div>
        <div className={link}>
          <span className="relative rounded-full bg-sheet-sunk px-2 text-[0.78rem] font-medium text-ink-3">
            pub/sub wake
          </span>
        </div>
        <div className={cn(box, "justify-center md:w-[24%]")}>
          <span className={cn(label, "flex items-center gap-2")}>
            <Database aria-hidden className="size-4 text-ink-3" /> Redis
          </span>
          <span className={sub}>TTLs are the retention policy</span>
        </div>
      </div>
      <figcaption className="mt-6 max-w-[70ch] text-[0.92rem] text-ink-2">
        No realtime server and no worker beyond one daily cron. A message wakes
        every held poll on that channel; the signal carries nothing but "look
        again".
      </figcaption>
    </figure>
  );
}

type Commit = [date: string, subject: string, claude: 0 | 1];

/** All 220 commits in order; the ones with a Claude co-author line are filled. */
export function CommitGrid() {
  const list = commits as Commit[];
  const [hover, setHover] = useState<Commit | null>(null);
  const withClaude = list.filter((c) => c[2]).length;

  return (
    <figure className="m-0 rounded-[32px] bg-sheet p-6 shadow-[var(--shadow-tile)] sm:p-8">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="text-[1.05rem] font-semibold text-ink">
          Every commit, oldest first
        </span>
        <span className="flex items-center gap-4 text-[0.85rem] text-ink-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-[var(--wave)]" /> Claude
            co-author ({withClaude})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-line" /> Without (
            {list.length - withClaude})
          </span>
        </span>
      </figcaption>
      <div
        aria-hidden
        className="mt-6 flex flex-wrap gap-[5px]"
        onPointerLeave={() => setHover(null)}
      >
        {list.map((c, i) => (
          <span
            key={i}
            onPointerEnter={() => setHover(c)}
            className={cn(
              "size-[14px] rounded-[4px] transition-transform duration-150 ease-out hover:scale-[1.5]",
              c[2] ? "bg-[var(--wave)]" : "bg-line",
            )}
          />
        ))}
      </div>
      <p aria-hidden className="mt-4 min-h-[2.8em] text-[0.88rem] text-ink-2">
        {hover ? (
          <>
            <span className="tabular text-ink-3">{hover[0]}</span> · {hover[1]}
          </>
        ) : (
          <span className="text-ink-3">
            Hover a commit to read its message.
          </span>
        )}
      </p>
    </figure>
  );
}
