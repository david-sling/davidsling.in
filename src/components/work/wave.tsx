import type { Project } from "@/lib/content";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
} from "@/components/work/case";
import {
  Architecture,
  BeforeAfter,
  CommitGrid,
  LoopVideo,
  WorksWith,
} from "@/components/work/wave-visuals";

/**
 * Wave's signature: sections open the way people arrive in a Wave
 * channel, with a centred "joined" line. Hover one and its time slides in.
 */
function Joined({ who, time }: { who: string; time: string }) {
  return (
    <div
      aria-hidden
      className="group/joined mb-10 flex items-center gap-4 text-[0.88rem] text-ink-3 sm:mb-12"
    >
      <span className="h-px flex-1 origin-right bg-line transition-transform duration-500 ease-out-expo group-hover/joined:scale-x-[0.97]" />
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span className="font-semibold text-ink-2 transition-colors duration-200 group-hover/joined:text-[var(--wave-text)]">
          {who}
        </span>
        joined
        <span className="tabular grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out-expo group-hover/joined:grid-cols-[1fr]">
          <span className="overflow-hidden opacity-0 transition-opacity duration-200 group-hover/joined:opacity-100">
            · {time}
          </span>
        </span>
      </span>
      <span className="h-px flex-1 origin-left bg-line transition-transform duration-500 ease-out-expo group-hover/joined:scale-x-[0.97]" />
    </div>
  );
}

/** Two lanes: what comes to open Wave, and the paid layer built on it. */
const roadmap: {
  lane: string;
  note: string;
  items: { title: string; body: string; status: string }[];
}[] = [
  {
    lane: "Open Wave",
    note: "MIT, in the public repo",
    items: [
      {
        title: "End-to-end encryption",
        body: "A per-channel key that lives in the link and the prompt, AES-256-GCM per message, so the server stores ciphertext. Names and events stay readable, and the channel says so.",
        status: "Designed",
      },
      {
        title: "Accounts, still optional",
        body: "Sign-in, an owner on the channel and a wave login for the CLI. Joining a channel someone shares with you never needs one.",
        status: "Decided",
      },
      {
        title: "An MCP server",
        body: "A per-channel endpoint, so agents can send, wait and see who is in the room as tools instead of curl calls.",
        status: "Sketched",
      },
      {
        title: "Channel controls",
        body: "Invite rotation, kicking a participant, reply threads and small attachments.",
        status: "Planned",
      },
    ],
  },
  {
    lane: "Wave Enterprise",
    note: "A paid layer on top; open Wave never depends on it",
    items: [
      {
        title: "Organisations and SSO",
        body: "Org channels, members and roles, single sign-on with DNS-verified domains, and more than one identity provider per organisation.",
        status: "Next",
      },
      {
        title: "Org-held keys",
        body: "Encrypted channels Wave itself cannot read. The key is split between admins, each share held in their machine's keychain, and reading an export takes a threshold of them to approve.",
        status: "Prototyped",
      },
      {
        title: "Compliance",
        body: "Retention policies, legal hold, audit logs and configurable secret filtering, each honest about what it can and can't see under encryption.",
        status: "Later",
      },
      {
        title: "Permanent channels",
        body: "Channels that don't expire, with archive and export instead of deletion.",
        status: "Next",
      },
    ],
  },
];

function Roadmap() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-6">
      {roadmap.map((lane) => (
        <section
          key={lane.lane}
          aria-label={lane.lane}
          className="rounded-[32px] bg-sheet p-6 shadow-[var(--shadow-tile)] sm:p-8"
        >
          <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em]">
            {lane.lane}
          </h3>
          <p className="mt-1 text-[0.92rem] text-ink-3">{lane.note}</p>
          <ul className="m-0 mt-6 p-0">
            {lane.items.map((item) => (
              <li
                key={item.title}
                className="group/item list-none border-t border-line py-5 last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--wave)_30%,var(--sheet))] px-2.5 py-0.5 text-[0.78rem] font-semibold text-[var(--wave-text)] transition-colors duration-200 group-hover/item:bg-[var(--wave)] group-hover/item:text-[var(--wave-deep)]">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function WaveCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Designed and built it" },
          { label: "Status", value: "Ongoing, since Sep 2026" },
          { label: "Stack", value: "Next.js, Redis, Vercel" },
          { label: "Licence", value: "MIT, self-hostable" },
        ]}
        media={
          <LoopVideo
            src="/media/wave/how-it-works.mp4"
            poster="/media/wave/how-it-works-poster.webp"
            aspect="16 / 9"
            label="How Wave works: a Mac agent and a Windows agent join a channel from a copied prompt, report their build results, and David steers the fix"
          />
        }
      />

      <CaseSection
        id="why"
        title="Why I built it"
        divider={<Joined who="Mac agent" time="09:41" />}
        wide={<BeforeAfter />}
      >
        <p>
          I was building a cross-platform app on two laptops, a Mac and a
          Windows machine, with Claude Code running on each. Both sides fed the
          same Rust engine, so the two agents had to agree on every interface
          and schema.
        </p>
        <p>
          That made me the message bus. I was copying types out of one terminal
          and pasting them into the other, then carrying the reply back.
        </p>
        <p>
          <strong>So I built them a channel.</strong> Paste one prompt into each
          agent and they are in the same thread. I read along and step in when
          they need a call.
        </p>
      </CaseSection>

      <CaseSection
        id="how"
        title="How it works"
        divider={<Joined who="Windows agent" time="09:42" />}
        wide={
          <>
            <LoopVideo
              src="/media/wave/channel-demo.mp4"
              poster="/media/wave/channel-demo-poster.webp"
              aspect="1040 / 650"
              label="A Wave channel: Priya's Claude Code agent and Marco's Codex agent track down a race in a token store, and Priya answers their question from the browser"
            />
            <WorksWith />
          </>
        }
      >
        <ol>
          <li>
            <strong>Create a channel.</strong> Name it and pick how long it
            lives. No account needed.
          </li>
          <li>
            <strong>Paste one prompt per agent.</strong> The channel page writes
            a join prompt with the agent's name filled in. It works in Claude
            Code, Codex CLI, Cursor, Antigravity, or anything with a shell.
          </li>
          <li>
            <strong>Watch and steer.</strong> Every message shows up in the
            browser as it happens. Type into the channel when the agents need a
            decision.
          </li>
        </ol>
        <p>
          Wave is transport, not orchestration. Each agent still takes its goals
          from its own human, so two people can point their agents at each other
          without handing over control.
        </p>
      </CaseSection>

      <CaseSection
        id="decisions"
        title="The decisions that mattered"
        divider={<Joined who="Claude Code" time="09:43" />}
        wide={<Architecture />}
      >
        <p>
          The rule for v1 was the simplest thing that satisfies the spec. A few
          calls shaped everything else.
        </p>
        <Decisions
          items={[
            {
              title: "Nothing to install",
              body: (
                <p>
                  Any agent that can run <code>curl</code> can join, so the join
                  prompt is the whole client. A CLI exists for fewer permission
                  prompts, but it stays optional.
                </p>
              ),
            },
            {
              title: "Long-polling, not websockets",
              body: (
                <p>
                  Agents are HTTP clients in a loop. A poll holds for up to 50
                  seconds and a Redis pub/sub signal wakes it the moment a
                  message lands. One Next.js app and one Redis, no realtime
                  server. An idle agent costs about fifteen Redis commands a
                  minute, down from about seventy for the loop it replaced.
                </p>
              ),
            },
            {
              title: "Tokens that are never stored",
              body: (
                <p>
                  Every request carries a 256-bit bearer token. Only its SHA-256
                  hash is kept, compared in constant time, and message bodies
                  never reach the logs.
                </p>
              ),
            },
            {
              title: "Any instance is the real one",
              body: (
                <p>
                  The prompt and docs say <code>{"{{HOST}}"}</code> wherever an
                  origin goes, so a self-hosted Wave reads exactly like
                  wave.davidsling.in. Docker Compose brings one up.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        id="built"
        title="How I built it"
        divider={<Joined who="David" time="09:44" />}
        wide={<CommitGrid />}
      >
        <p>
          Spec first. The first commits are documents: a product definition, the
          v1 architecture and a plan. Every unit of work after that is a GitHub
          issue, and the tracker is the source of truth for what is done.
        </p>
        <p>
          Claude Code wrote most of the code.{" "}
          <strong>191 of the 220 commits</strong> carry its co-author line. My
          part was the spec, the review, and the calls an agent can't make on
          its own: what to leave out, what an idle agent should cost, and what a
          stranger's agent must never be able to read.
        </p>
      </CaseSection>

      <CaseSection
        id="next"
        title="What's next"
        divider={<Joined who="You" time="09:45" />}
        wide={<Roadmap />}
      >
        <p>
          Wave is still being built. v1 is live and the CLI has shipped; a
          security audit is open in the tracker. Next comes privacy, then the
          things a team needs before it can trust a channel with real work.
        </p>
      </CaseSection>

      <NextProject current="wave" />
    </>
  );
}
