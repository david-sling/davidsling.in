import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Project } from "@/lib/content";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
} from "@/components/work/case";

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

/** The landing page's "how it works" video. Plays in view; always pausable. */
function WaveVideo() {
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
        src="/media/wave/how-it-works.mp4"
        poster="/media/wave/how-it-works-poster.webp"
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="How Wave works: a Mac agent and a Windows agent join a channel from a copied prompt, report their build results, and David steers the fix"
        className="block aspect-video w-full"
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

export function WaveCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Designed and built it" },
          { label: "When", value: "Sep–Oct 2026" },
          { label: "Stack", value: "Next.js, Redis, Vercel" },
          { label: "Licence", value: "MIT, self-hostable" },
        ]}
        media={<WaveVideo />}
      />

      <CaseSection
        id="why"
        title="Why I built it"
        divider={<Joined who="Mac agent" time="09:41" />}
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

      <NextProject current="wave" />
    </>
  );
}
