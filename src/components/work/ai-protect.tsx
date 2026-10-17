import { useState } from "react";
import { Check, RotateCcw, ShieldCheck } from "lucide-react";
import type { Project } from "@/lib/content";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
  onField,
} from "@/components/work/case";
import { cn } from "@/lib/utils";
import { TextMorph } from "torph/react";

/**
 * AI Protect was built at NEXTech, so everything here comes from the
 * product's public site: no source, no internals, sample data only.
 */

/** Hero: the first question the product answers, with sample rows. */
function ToolsInUse() {
  const rows: [string, number, string, boolean][] = [
    ["ChatGPT", 9, "Browser", true],
    ["Claude", 4, "Desktop app", true],
    ["Grammarly", 6, "Extension", false],
    ["Gemini", 3, "Browser", false],
    ["Perplexity", 2, "Browser", false],
  ];
  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label="Sample console view: AI tools in use over the last 7 days, with how many people use each, where from, and whether it is approved"
        data-motion="travel"
        className="rounded-[28px] bg-[oklch(1_0_0/0.82)] p-5 text-[var(--ai-protect-ink)] shadow-[0_24px_40px_-24px_oklch(0.25_0.12_266/0.6)] sm:p-6"
      >
        <div aria-hidden>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-semibold">AI tools in use</p>
            <p className="text-[0.85rem] font-medium opacity-70">Last 7 days</p>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-x-4 text-[0.88rem] sm:grid-cols-[1fr_auto_auto_auto]">
            {rows.map(([tool, people, from, ok]) => (
              <div
                key={tool}
                className="col-span-full grid grid-cols-subgrid items-center border-t border-[oklch(0.28_0.1_266/0.12)] py-2.5"
              >
                <span className="font-semibold">{tool}</span>
                <span className="tabular text-right opacity-80">
                  {people} people
                </span>
                <span className="hidden opacity-70 sm:block">{from}</span>
                <span
                  className={cn(
                    "justify-self-end rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold",
                    ok
                      ? "bg-[var(--ai-protect)] text-white"
                      : "bg-[oklch(0.28_0.1_266/0.08)]",
                  )}
                >
                  {ok ? "Approved" : "Your call"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[0.88rem] font-medium text-[var(--muted)]">
        Sample data, in the shape of the real console.
      </figcaption>
    </figure>
  );
}

type Stage = "pasted" | "caught" | "cleaned";

/**
 * The signature: a paste into an AI tool, caught on the device. Send it
 * and the sensitive parts light up with a coaching card; take the
 * suggestion and they are replaced before anything leaves.
 */
function PasteDemo() {
  const [stage, setStage] = useState<Stage>("pasted");

  const Hit = ({ text, label }: { text: string; label: string }) =>
    stage === "cleaned" ? (
      <span className="rounded-md bg-[oklch(0.28_0.1_266/0.1)] px-1 font-mono text-[0.85em]">
        [{label}]
      </span>
    ) : (
      <mark
        className={cn(
          "rounded-md px-0.5 text-inherit transition-colors duration-200",
          stage === "caught"
            ? "bg-[var(--ai-protect)] text-white"
            : "bg-transparent",
        )}
      >
        {text}
      </mark>
    );

  return (
    <figure
      className="m-0 grid gap-6 rounded-[40px] px-5 py-8 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start"
      style={
        {
          background: "var(--ai-protect)",
          ...onField("ai-protect"),
        } as React.CSSProperties
      }
    >
      <div className="rounded-[28px] bg-[oklch(1_0_0/0.9)] p-5 text-[var(--ai-protect-ink)] sm:p-6">
        <p className="text-[0.85rem] font-semibold opacity-70">
          An AI assistant, any of them
        </p>
        <div className="mt-3 rounded-[18px] bg-white p-4 shadow-[0_1px_0_oklch(0.28_0.1_266/0.08)]">
          <p className="inline-flex items-center gap-2 rounded-lg bg-[oklch(0.28_0.1_266/0.06)] px-2.5 py-1.5 text-[0.82rem] font-semibold">
            Whitfield_1040_2025.pdf
          </p>
          <p className="mt-3 leading-relaxed" aria-live="polite">
            Draft a summary email for this client. Their SSN is{" "}
            <Hit text="078-05-1120" label="SSN" /> and the refund goes to
            account <Hit text="4417 2290 0183" label="account" />.
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setStage(stage === "pasted" ? "caught" : "pasted")}
            className={cn(
              "group/send inline-flex min-h-11 select-none items-center gap-2 rounded-full font-semibold transition-[transform,background-color,color] duration-200 ease-out-quart active:scale-[0.97] active:duration-75",
              stage === "pasted"
                ? "bg-[var(--ai-protect)] px-6 text-white hover:bg-[var(--ai-protect-strong)]"
                : "px-4 hover:bg-[oklch(0.28_0.1_266/0.08)]",
            )}
          >
            {stage !== "pasted" && (
              <RotateCcw
                aria-hidden
                className="size-4 transition-transform duration-300 ease-out-expo group-hover/send:-rotate-45"
              />
            )}
            <TextMorph as="span" duration={420} className="whitespace-nowrap">
              {stage === "pasted" ? "Send" : "Start over"}
            </TextMorph>
          </button>
        </div>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "rounded-[28px] p-5 transition-[background-color,box-shadow] duration-300 sm:p-6",
          stage === "pasted"
            ? "bg-[oklch(1_0_0/0.3)]"
            : "bg-[oklch(1_0_0/0.94)] text-[var(--ai-protect-ink)] shadow-[0_24px_40px_-24px_oklch(0.25_0.12_266/0.6)]",
        )}
      >
        <p className="flex items-center gap-2 font-semibold">
          <ShieldCheck aria-hidden className="size-5" />
          AI Protect
          {stage !== "pasted" && (
            <span className="ml-auto rounded-full bg-[var(--ai-protect)] px-2.5 py-0.5 text-[0.78rem] text-white">
              <TextMorph as="span" duration={420}>
                {stage === "caught" ? "Coached" : "Cleaned"}
              </TextMorph>
            </span>
          )}
        </p>
        {stage === "pasted" && (
          <p className="mt-3 font-medium text-[var(--muted)]">
            Press Send. The check runs on this computer before anything leaves
            it.
          </p>
        )}
        {stage === "caught" && (
          <>
            <p className="mt-3 text-[1.15rem] font-semibold">
              Tax return details found
            </p>
            <ul className="m-0 mt-2 space-y-1 p-0">
              {["Social Security number", "Refund account"].map((t) => (
                <li key={t} className="flex list-none items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 rounded-full bg-[var(--ai-protect)]"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.9rem] font-medium opacity-70">
              Checked on this computer. Nothing was sent.
            </p>
            <button
              type="button"
              onClick={() => setStage("cleaned")}
              className="mt-5 inline-flex min-h-11 w-full select-none items-center justify-center rounded-full bg-[var(--ai-protect)] px-6 font-semibold text-white transition-[transform,background-color] duration-150 ease-out-quart hover:bg-[var(--ai-protect-strong)] active:scale-[0.98] active:duration-75"
            >
              Remove the details
            </button>
          </>
        )}
        {stage === "cleaned" && (
          <>
            <p className="mt-3 flex items-center gap-2 text-[1.15rem] font-semibold">
              <Check aria-hidden className="size-5" />
              Sent without them
            </p>
            <p className="mt-2 font-medium opacity-70">
              The email still gets drafted. The client's numbers stayed on the
              computer.
            </p>
          </>
        )}
      </div>

      <figcaption className="text-[0.88rem] font-medium text-[var(--muted)] lg:col-span-2">
        Sample client, sample numbers. The flow follows the product site's own
        example.
      </figcaption>
    </figure>
  );
}

/** What stays on the device and what the console sees, as published. */
function PrivacySplit() {
  const lists: [string, string[]][] = [
    [
      "Never leaves the computer",
      [
        "The text or file being pasted or uploaded",
        "Keystrokes, screens, browsing history",
        "Anything typed that isn't a paste into an AI tool",
      ],
    ],
    [
      "What the console receives",
      [
        "Which kind of sensitive data was found",
        "Who, which AI tool, and what AI Protect did",
        "A masked snippet of the surrounding text, only if you turn it on",
        "Which assistant and model a person used, only for people you opt in",
      ],
    ],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lists.map(([title, items], i) => (
        <section
          key={title}
          aria-label={title}
          className={cn(
            "rounded-[32px] p-6 sm:p-8",
            i === 0
              ? "bg-[var(--ai-protect)] text-white"
              : "bg-sheet shadow-[var(--shadow-tile)]",
          )}
        >
          <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em]">
            {title}
          </h3>
          <ul className="m-0 mt-5 p-0">
            {items.map((item) => (
              <li
                key={item}
                className={cn(
                  "list-none border-t py-3 last:pb-0",
                  i === 0 ? "border-white/20" : "border-line text-ink-2",
                )}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function AiProtectCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Led it end to end" },
          { label: "Team", value: "Four people" },
          { label: "Built at", value: "NEXTech, 2026" },
          { label: "Runs on", value: "macOS and Windows" },
        ]}
        media={<ToolsInUse />}
      />

      <CaseSection id="problem" title="The problem">
        <p>
          People paste client work into AI tools, and most of those tools were
          never approved by anyone. The product site cites a Teramind report:
          more than eight in ten employees use AI tools nobody signed off on.
        </p>
        <p>
          For a CPA firm, a law office or a dental practice, that is a tax
          return or a patient record in a chat window. These firms rarely have a
          security team, and most owners can't say which AI tools their people
          use. <strong>Banning AI doesn't work either</strong>: the tools help,
          so people find a way.
        </p>
      </CaseSection>

      <CaseSection id="paste" title="Caught at the paste" wide={<PasteDemo />}>
        <p>
          AI Protect answers two questions. First, who is using what, and
          whether you approved it. Second, what just got pasted or uploaded into
          one of those tools.
        </p>
        <p>
          The firm decides what counts as sensitive: client records, financial
          details, medical information, or its own lists. When a paste matches,
          the risky part is held back and everything else goes through, so the
          work still gets done. Try it below.
        </p>
      </CaseSection>

      <CaseSection
        id="privacy"
        title="Private by default"
        wide={<PrivacySplit />}
      >
        <p>
          A tool that watches what people paste could easily become
          surveillance. We drew the line in the product itself. The check runs
          on the device, and the console learns what happened, not what was
          said.
        </p>
      </CaseSection>

      <CaseSection id="decisions" title="The decisions that mattered">
        <Decisions
          items={[
            {
              title: "Coach before you block",
              body: (
                <p>
                  Every rule ends in one of five actions: allow, log only,
                  coach, redact or block. Coaching shows people why something
                  was held and what to do instead, like pointing them to the
                  firm's approved AI workspace.
                </p>
              ),
            },
            {
              title: "Policy follows the person",
              body: (
                <p>
                  A rule is data type × destination × channel, and the first
                  match wins. Policy is assigned to a person, not a machine, so
                  it follows them across devices and reaches each one within a
                  check-in.
                </p>
              ),
            },
            {
              title: "No green it hasn't earned",
              body: (
                <p>
                  The console shows every device's real state, down to the agent
                  version. A device that has gone quiet shows Unknown, never a
                  reassuring green.
                </p>
              ),
            },
            {
              title: "MDM is optional",
              body: (
                <p>
                  Small firms often have no device management. One emailed link
                  per employee installs it; firms that do have Jamf, Intune,
                  Kandji or Hexnode push the same signed installer.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection id="built" title="My part">
        <p>
          I led AI Protect end to end with a team of four: the product thinking,
          the decisions, and the build across the endpoint agent, the browser
          extension and the console.
        </p>
        <p>
          It ran on the same workflow as my own projects. Decisions were written
          down before code, tests came first, and agents wrote a lot of the code
          under review. The product is commercial, so this page sticks to what
          its public site already says.
        </p>
      </CaseSection>

      <NextProject current="ai-protect" />
    </>
  );
}
