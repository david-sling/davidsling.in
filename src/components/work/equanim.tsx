import { useState } from "react";
import type { Project } from "@/lib/content";
import { Pendulum, type PendulumPart } from "@/components/pendulum";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
  onField,
} from "@/components/work/case";
import { cn } from "@/lib/utils";

/**
 * Equanim's signature: an excerpt of the real double-pendulum spec beside
 * a live render. Hovering, focusing or tapping a block lights up the part
 * of the drawing its equations produce.
 */
type Block = { lines: string[]; part?: PendulumPart; label?: string };

// Trimmed from renderer/specs/double-pendulum.json in the public repo; "…" marks a cut.
const spec: Block[] = [
  {
    lines: [
      '{ "id": "phys", "type": "ode_system",',
      '  "solver": "rk4", "step": 0.005,',
      '  "derivatives": { "th1": "w1", "th2": "w2", … } },',
    ],
  },
  {
    part: "arm1",
    label: "the upper arm",
    lines: [
      '{ "id": "arm1", "type": "line", "equations": {',
      '  "x2": "L1*ppm*sin(phys_th1(t*d))",',
      '  "y2": "y_off - L1*ppm*cos(phys_th1(t*d))" } },',
    ],
  },
  {
    part: "arm2",
    label: "the lower arm",
    lines: [
      '{ "id": "arm2", "type": "line", "equations": {',
      '  "x2": "… + L2*ppm*sin(phys_th2(t*d))",',
      '  "y2": "… - L2*ppm*cos(phys_th2(t*d))" } },',
    ],
  },
  {
    part: "bob2",
    label: "the lower bob",
    lines: [
      '{ "id": "bob2", "type": "circle", "equations": {',
      '  "cx": "… + L2*ppm*sin(phys_th2(t*d))",',
      '  "r": "12" } },',
    ],
  },
  {
    part: "trace",
    label: "the trace",
    lines: [
      '{ "id": "trace", "type": "parametric_path", "equations": {',
      '  "x": "… sin(phys_th2(clamp(s,0,root_t)*root_d))" } }',
    ],
  },
];

/** Keys, strings and punctuation in three tones, nothing more. */
function Line({ text }: { text: string }) {
  const parts = text.split(/("(?:[^"\\]|\\.)*")/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p.startsWith('"'))
          return (
            <span key={i} className="text-[oklch(0.72_0.03_220)]">
              {p}
            </span>
          );
        const isKey = parts[i + 1]?.trimStart().startsWith(":");
        return (
          <span
            key={i}
            className={
              isKey
                ? "text-[oklch(0.82_0.1_205)]"
                : "text-[oklch(0.96_0.01_210)]"
            }
          >
            {p}
          </span>
        );
      })}
    </>
  );
}

function SpecBesideRender() {
  const [lit, setLit] = useState<PendulumPart | null>(null);

  return (
    <figure
      className="m-0 rounded-[40px] p-4 sm:p-6 lg:p-8"
      style={
        {
          background: "var(--equanim)",
          ...onField("equanim"),
        } as React.CSSProperties
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
        <div
          className="min-w-0 overflow-hidden rounded-[24px] bg-[var(--equanim-deep)] py-3"
          onPointerLeave={() => setLit(null)}
        >
          <pre className="m-0 overflow-x-auto font-mono text-[0.78rem] leading-[1.7] sm:text-[0.84rem]">
            {spec.map((b, i) =>
              b.part ? (
                <button
                  key={i}
                  type="button"
                  aria-pressed={lit === b.part}
                  aria-label={`Highlight ${b.label} in the render`}
                  onPointerEnter={(e) =>
                    e.pointerType === "mouse" && setLit(b.part!)
                  }
                  onFocus={() => setLit(b.part!)}
                  onBlur={() => setLit(null)}
                  onClick={() =>
                    setLit((cur) => (cur === b.part ? null : b.part!))
                  }
                  className={cn(
                    "block w-full min-w-max cursor-default px-5 py-1 text-left transition-colors duration-150",
                    lit === b.part
                      ? "bg-[oklch(1_0_0/0.1)]"
                      : "hover:bg-[oklch(1_0_0/0.05)]",
                    lit && lit !== b.part && "opacity-55",
                  )}
                >
                  {b.lines.map((l) => (
                    <span key={l} className="block whitespace-pre">
                      <Line text={l} />
                    </span>
                  ))}
                </button>
              ) : (
                <span
                  key={i}
                  className={cn(
                    "block px-5 py-1 transition-opacity duration-150",
                    lit && "opacity-55",
                  )}
                >
                  {b.lines.map((l) => (
                    <span key={l} className="block whitespace-pre">
                      <Line text={l} />
                    </span>
                  ))}
                </span>
              ),
            )}
          </pre>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[24px] bg-[oklch(1_0_0/0.18)]">
          <Pendulum highlight={lit} className="absolute inset-0 size-full" />
          <p
            aria-live="polite"
            className="absolute bottom-4 left-4 rounded-full bg-[oklch(1_0_0/0.85)] px-3 py-1 text-[0.78rem] font-semibold"
          >
            {lit
              ? `Drawing ${spec.find((b) => b.part === lit)?.label}`
              : "Running live, RK4"}
          </p>
        </div>
      </div>
      <figcaption className="mt-5 max-w-[70ch] px-2 text-[0.92rem] font-medium text-[var(--muted)]">
        Hover or tap a block to see what it draws. The spec is trimmed from
        Equanim's double-pendulum example; the render is a small canvas port of
        the same equations.
      </figcaption>
    </figure>
  );
}

export function EquanimCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Designed and built it" },
          { label: "When", value: "4 days, March 2026" },
          { label: "Stack", value: "TypeScript, mathjs, Canvas" },
          { label: "Tests", value: "279 assertions" },
        ]}
        media={
          <div className="relative aspect-[5/4] w-full">
            <Pendulum className="absolute inset-0 size-full" />
          </div>
        }
      />

      <CaseSection id="idea" title="The idea">
        <p>
          Most animation formats describe keyframes. Equanim describes
          functions. Every number in every frame is a maths expression evaluated
          at time <code>t</code>. A circle that grows is <code>r = 50 * t</code>
          . A wave that decays is{" "}
          <code>amplitude * exp(-decay * t) * sin(k * s - omega * t)</code>. The
          whole animation is a function.
        </p>
        <p>
          A spec is pure JSON: no code, nothing to execute, no renderer
          assumptions. Hand it to any renderer and it plays.{" "}
          <strong>And it is written for language models</strong>, which are good
          at equations and bad at nudging keyframes around a timeline.
        </p>
      </CaseSection>

      <CaseSection
        id="spec"
        title="Every number is an equation"
        wide={<SpecBesideRender />}
      >
        <p>
          The double pendulum is the example that convinced me the format works.
          Its motion is chaotic, so it can't be faked with keyframes. The spec
          declares the physics once as an <code>ode_system</code>, integrated
          with RK4, and every object reads the solved angles as functions like{" "}
          <code>phys_th1(t)</code>.
        </p>
      </CaseSection>

      <CaseSection id="decisions" title="The decisions that mattered">
        <Decisions
          items={[
            {
              title: "Data, not code",
              body: (
                <p>
                  Expressions are strings evaluated by mathjs, never JavaScript.
                  A renderer can validate a spec's shape without running any of
                  it, and a generated spec can't do anything but draw.
                </p>
              ),
            },
            {
              title: "t-first",
              body: (
                <p>
                  The default clock is local: <code>t</code> runs 0 to 1 over an
                  object's own window. Moving an object's window changes when
                  and how fast it plays, not whether it is visible. Real seconds
                  are one multiply away.
                </p>
              ),
            },
            {
              title: "Physics as data",
              body: (
                <p>
                  An <code>ode_system</code> holds state and derivatives and
                  names a solver. Its solved state becomes functions sibling
                  objects can call, so arms, bobs and the trace all read one
                  simulation.
                </p>
              ),
            },
            {
              title: "Built for a model to write",
              body: (
                <p>
                  The schema is flat and regular on purpose. The test for the
                  format is whether a model, given only <code>spec.md</code>,
                  can write a valid and interesting spec without help.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection id="built" title="How I built it">
        <p>
          About four days in March 2026. The first commit is a{" "}
          <code>CLAUDE.md</code>, and the agent worked from that and from{" "}
          <code>spec.md</code>, which is the source of truth: when the renderer
          and the spec disagree, the spec wins.
        </p>
        <p>
          Every core module has its own test file,{" "}
          <strong>279 assertions</strong> with no test framework. That is what
          let an agent change the evaluator or the solver without me re-checking
          every example by eye.
        </p>
      </CaseSection>

      <NextProject current="equanim" />
    </>
  );
}
