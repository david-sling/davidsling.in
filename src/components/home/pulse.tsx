import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";
import { siSpotify } from "simple-icons";
import type { ContributionDay, GithubPulse } from "@/routes/api/github";
import type { NowPlaying } from "@/routes/api/now-playing";
import { cn } from "@/lib/utils";
import { NowBuilding } from "@/components/home/now-building";

type Load<T> =
  { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

function useJson<T>(url: string, refreshMs?: number): Load<T> {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(url)
        .then((r) =>
          r.ok ? (r.json() as Promise<T>) : Promise.reject(r.status),
        )
        .then((data) => alive && setState({ status: "ready", data }))
        .catch(
          () =>
            alive &&
            setState((s) => (s.status === "ready" ? s : { status: "error" })),
        );
    load();
    const id = refreshMs
      ? setInterval(
          () => document.visibilityState === "visible" && load(),
          refreshMs,
        )
      : undefined;
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [url, refreshMs]);
  return state;
}

const card =
  "rounded-[32px] bg-sheet px-5 py-4 shadow-[var(--shadow-tile)] sm:px-6";
// One region inside the shared activity card; each is its own link.
const region =
  "block px-5 py-5 no-underline transition-colors duration-200 hover:bg-[color-mix(in_oklch,var(--blue)_7%,var(--sheet))] sm:px-7 sm:py-6";

/** Live GitHub heatmap, latest commit and Spotify, inside "How I build". */
export function Pulse() {
  const github = useJson<GithubPulse>("/api/github");
  const spotify = useJson<NowPlaying>("/api/now-playing", 60_000);
  const showSpotify =
    !(spotify.status === "ready" && !spotify.data.configured) &&
    spotify.status !== "error";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-[32px] bg-sheet shadow-[var(--shadow-tile)]">
        <Heatmap state={github} />
        <LatestCommit state={github} />
      </div>
      <NowBuilding />
      {showSpotify && <Spotify state={spotify} />}
    </div>
  );
}

const levelFill = [
  "bg-[color-mix(in_oklch,var(--blue)_14%,var(--sheet-sunk))]",
  "bg-[color-mix(in_oklch,var(--blue)_38%,var(--sheet))]",
  "bg-[color-mix(in_oklch,var(--blue)_62%,var(--sheet))]",
  "bg-blue",
  "bg-[color-mix(in_oklch,var(--blue-strong)_75%,var(--ink))]",
];

function Heatmap({
  state,
  className,
}: {
  state: Load<GithubPulse>;
  className?: string;
}) {
  const [hover, setHover] = useState<ContributionDay | null>(null);
  const days = state.status === "ready" ? state.data.days : [];
  const total = state.status === "ready" ? state.data.total : null;

  // Columns are weeks (Sunday first), matching GitHub's own calendar.
  const weeks = useMemo(() => {
    const cols: (ContributionDay | null)[][] = [];
    let col: (ContributionDay | null)[] = [];
    days.forEach((d, i) => {
      const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
      if (i === 0) col = Array(dow).fill(null);
      col.push(d);
      if (dow === 6) {
        cols.push(col);
        col = [];
      }
    });
    if (col.length) cols.push(col);
    return cols;
  }, [days]);

  if (
    state.status === "error" ||
    (state.status === "ready" && days.length === 0)
  ) {
    return (
      <div className={cn(region, "hover:bg-transparent", className)}>
        <p className="text-ink-2">
          GitHub isn’t answering right now. The activity is still on
          github.com/david-sling.
        </p>
      </div>
    );
  }

  const readout = hover
    ? `${hover.count === 0 ? "No" : hover.count} contribution${hover.count === 1 ? "" : "s"} on ${formatDay(hover.date)}`
    : "Hover a day";

  return (
    <a
      href="https://github.com/david-sling"
      target="_blank"
      rel="noreferrer"
      className={cn(region, "group/pulse", className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[1.05rem] font-semibold">
          {total === null ? (
            <span className="inline-block h-5 w-56 rounded-full bg-sheet-sunk align-middle" />
          ) : (
            <>
              <span className="tabular">{total.toLocaleString("en-IN")}</span>{" "}
              contributions in the last year
            </>
          )}
        </h3>
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-ink-3 transition-transform duration-300 ease-out-expo group-hover/pulse:-translate-y-0.5 group-hover/pulse:translate-x-0.5 group-hover/pulse:text-ink"
        />
      </div>
      <div
        aria-hidden
        className="mt-5 flex justify-end gap-[3px] overflow-hidden"
        onPointerLeave={() => setHover(null)}
      >
        {(weeks.length
          ? weeks
          : Array.from({ length: 53 }, () => Array(7).fill(null))
        ).map((week, w) => (
          <div key={w} className="grid shrink-0 grid-rows-7 gap-[3px]">
            {Array.from({ length: 7 }, (_, d) => {
              const day = week[d];
              return (
                <span
                  key={d}
                  onPointerEnter={() => day && setHover(day)}
                  className={cn(
                    "size-[11px] rounded-[3px] transition-transform duration-150 ease-out",
                    day ? levelFill[day.level] : "bg-transparent",
                    day && "hover:scale-[1.45]",
                    !weeks.length && "bg-sheet-sunk",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p aria-hidden className="tabular mt-3 h-5 text-[0.85rem] text-ink-3">
        {weeks.length ? readout : ""}
      </p>
      <span className="sr-only">(opens GitHub in a new tab)</span>
    </a>
  );
}

function LatestCommit({
  state,
  className,
}: {
  state: Load<GithubPulse>;
  className?: string;
}) {
  const commit = state.status === "ready" ? state.data.commit : null;
  if (state.status !== "loading" && !commit) {
    return (
      <div className={cn(region, "hover:bg-transparent", className)}>
        <p className="text-ink-2">
          The latest commit is hiding. Try github.com/david-sling.
        </p>
      </div>
    );
  }
  return (
    <a
      href={commit?.url ?? "https://github.com/david-sling"}
      target="_blank"
      rel="noreferrer"
      className={cn(region, "group/pulse flex flex-col", className)}
    >
      <h3 className="flex items-center gap-2 text-[0.92rem] font-semibold text-ink-2">
        <GitCommitHorizontal aria-hidden className="size-4 text-blue-text" />
        Latest commit
        {commit && (
          <span className="font-medium text-ink-3">
            · {timeAgo(commit.date)}
          </span>
        )}
      </h3>
      {commit ? (
        <>
          <p className="mt-3 line-clamp-2 text-[1.15rem] font-semibold leading-snug tracking-[-0.01em]">
            {commit.message}
          </p>
          <p className="mt-3 flex items-center justify-between gap-3 text-[0.88rem] text-ink-2">
            <span className="truncate">
              {commit.repo}{" "}
              <span className="font-mono text-[0.82rem] text-ink-3">
                {commit.sha}
              </span>
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 transition-transform duration-300 ease-out-expo group-hover/pulse:-translate-y-0.5 group-hover/pulse:translate-x-0.5"
            />
          </p>
        </>
      ) : (
        <div aria-hidden className="mt-3 space-y-2">
          <div className="h-5 w-4/5 rounded-full bg-sheet-sunk" />
          <div className="h-4 w-2/5 rounded-full bg-sheet-sunk" />
        </div>
      )}
      <span className="sr-only">(opens GitHub in a new tab)</span>
    </a>
  );
}

function Spotify({ state }: { state: Load<NowPlaying> }) {
  const data =
    state.status === "ready" && state.data.configured ? state.data : null;
  const track = data?.track ?? null;
  const playing = !!data?.playing;

  if (state.status === "ready" && !track) {
    return (
      <div className={card}>
        <p className="text-ink-2">
          Nothing on Spotify right now. Probably in a meeting.
        </p>
      </div>
    );
  }

  return (
    <a
      href={
        track?.url ??
        "https://open.spotify.com/user/317z2rg7tkm3vgpnsr4dp7k7kjw4"
      }
      target="_blank"
      rel="noreferrer"
      className={cn(
        card,
        "group/pulse flex items-center gap-3.5 no-underline transition-[box-shadow] duration-300 hover:shadow-[var(--shadow-lift)]",
      )}
    >
      <div className="relative size-14 shrink-0">
        {track?.art ? (
          <img
            src={track.art}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            data-motion="travel"
            className="size-full rounded-[12px] object-cover shadow-[0_8px_18px_-8px_oklch(0_0_0/0.45)] transition-transform duration-500 ease-out-expo group-hover/pulse:-rotate-3 group-hover/pulse:scale-105"
          />
        ) : (
          <div className="size-full rounded-[12px] bg-sheet-sunk" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-[0.85rem] font-semibold text-ink-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="size-3.5 fill-[#1db954]"
          >
            <path d={siSpotify.path} />
          </svg>
          {playing ? "Listening now" : "Last played"}
          {playing && <Equaliser />}
        </h3>
        {track ? (
          <>
            <p className="mt-0.5 truncate font-semibold tracking-[-0.01em]">
              {track.title}
            </p>
            <p className="truncate text-[0.88rem] text-ink-2">{track.artist}</p>
          </>
        ) : (
          <div aria-hidden className="mt-2 space-y-2">
            <div className="h-4 w-3/4 rounded-full bg-sheet-sunk" />
            <div className="h-3.5 w-1/2 rounded-full bg-sheet-sunk" />
          </div>
        )}
      </div>
      <span className="sr-only">(opens Spotify in a new tab)</span>
    </a>
  );
}

function Equaliser() {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="w-[3px] origin-bottom rounded-full bg-[#1db954] motion-safe:animate-[eq_0.9s_ease-in-out_infinite]"
          style={{ height: "100%", animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

function formatDay(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function timeAgo(iso: string) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of steps)
    if (Math.abs(s) >= secs) return rtf.format(Math.round(s / secs), unit);
  return "just now";
}
