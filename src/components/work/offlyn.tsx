import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, RotateCcw } from "lucide-react";
import { TextMorph } from "torph/react";
import type { Project } from "@/lib/content";
import {
  CaseHero,
  CaseSection,
  Decisions,
  NextProject,
  onField,
} from "@/components/work/case";
import { OfflynScreens } from "@/components/work/offlyn-screens";
import { cn } from "@/lib/utils";

/**
 * offlyn.love's signature: its core privacy rule, played out. Before a
 * match the friend you share is hidden; liking back reveals who it is.
 * Sample people, labelled as such.
 */
function MutualFriendReveal() {
  const [matched, setMatched] = useState(false);

  return (
    <figure
      className="m-0 grid gap-8 overflow-hidden rounded-[40px] px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center"
      style={
        {
          background: "var(--offlyn)",
          ...onField("offlyn"),
        } as React.CSSProperties
      }
    >
      <div className="relative mx-auto w-full max-w-[420px]">
        <img
          src="/media/offlyn/match-pair.webp"
          alt="Two sample profile photos tilted toward each other"
          width={822}
          height={632}
          loading="lazy"
          className={cn(
            "w-full drop-shadow-[0_24px_30px_oklch(0.3_0.1_0/0.35)] transition-transform duration-700 ease-out-expo motion-reduce:transition-none",
            matched ? "scale-[1.03]" : "scale-100",
          )}
        />
      </div>

      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <p className="text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em]">
          <TextMorph as="span" duration={420}>
            {matched ? "It's a match." : "Someone liked you."}
          </TextMorph>
        </p>

        <p
          className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[oklch(1_0_0/0.3)] py-1.5 pl-1.5 pr-4 font-semibold"
          aria-live="polite"
        >
          <img
            src="/media/offlyn/common-friend.webp"
            alt=""
            width={96}
            height={96}
            loading="lazy"
            className={cn(
              "size-8 rounded-full object-cover transition-[filter,transform] duration-500 ease-out-expo motion-reduce:transition-[filter] motion-reduce:duration-200",
              matched ? "scale-100 blur-0" : "scale-90 blur-[5px]",
            )}
          />
          <TextMorph as="span" duration={420}>
            {matched ? "Both of you know Priya" : "You both know someone"}
          </TextMorph>
        </p>

        <button
          type="button"
          onClick={() => setMatched((m) => !m)}
          data-motion="travel"
          className="group/like mt-4 inline-flex h-12 select-none items-center gap-2.5 rounded-full bg-[var(--offlyn-deep)] pl-5 pr-6 font-semibold text-[var(--offlyn)] origin-bottom transition-[transform,background-color] duration-150 ease-out-quart hover:bg-[color-mix(in_oklch,var(--offlyn-deep)_86%,var(--offlyn))] active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75"
        >
          {matched ? (
            <RotateCcw
              aria-hidden
              className="size-4 transition-transform duration-300 ease-out-expo group-hover/like:-rotate-90"
            />
          ) : (
            <Heart
              aria-hidden
              className="size-4 transition-transform duration-300 ease-out-expo group-hover/like:scale-125"
              fill="currentColor"
            />
          )}
          <TextMorph as="span" duration={420} className="whitespace-nowrap">
            {matched ? "Start over" : "Like back"}
          </TextMorph>
        </button>

        <figcaption className="mt-6 max-w-[40ch] text-[0.92rem] font-medium text-[var(--muted)]">
          Sample profiles. The friend you have in common stays hidden until you
          both like each other.
        </figcaption>
      </div>
    </figure>
  );
}

export function OfflynCase({ project }: { project: Project }) {
  return (
    <>
      <CaseHero
        project={project}
        facts={[
          { label: "Role", value: "Product, design, engineering" },
          { label: "When", value: "2026" },
          { label: "Platforms", value: "Web, iOS, Android" },
          { label: "Stack", value: "Supabase, Expo, TanStack Start" },
        ]}
        media={
          <img
            src="/media/offlyn/match-dino.webp"
            alt="offlyn.love's match screen: two profile photos with the offlyn.love dino mascot"
            width={1200}
            height={981}
            fetchPriority="high"
            className="mx-auto w-full max-w-[520px] drop-shadow-[0_24px_30px_oklch(0.3_0.1_0/0.35)]"
          />
        }
      />

      <CaseSection id="idea" title="The idea">
        <p>
          Dating apps match you with strangers. offlyn.love matches you through
          friends of friends: your pool is the people your friends actually
          know, the way people met before apps.
        </p>
        <p>
          I took it end to end: the product, the brand, the landing page, a web
          app and an Expo app for iOS and Android.
        </p>
      </CaseSection>

      <CaseSection
        id="rule"
        title="The rule that took the most thought"
        wide={<MutualFriendReveal />}
      >
        <p>
          A mutual friend is the whole point, and also the riskiest thing to
          show. Name them too early and every swipe leaks who knows whom.
        </p>
        <p>
          <strong>
            So the friend stays hidden until you both like each other.
          </strong>{" "}
          Before a match it's "someone you both know". After it, their name is
          the opener.
        </p>
      </CaseSection>

      <CaseSection id="app" title="The app" wide={<OfflynScreens />}>
        <p>
          People shows you friends of your friends. A match names the friend you
          share, and the chat opens on them, so the first message is never
          "hey". The screens below are redrawn with sample profiles.
        </p>
      </CaseSection>

      <CaseSection id="decisions" title="The decisions that mattered">
        <Decisions
          items={[
            {
              title: "SQL as the API",
              body: (
                <p>
                  I started with Edge Functions out of habit. The agent wrote
                  SQL more fluently than I do, so the API became Postgres
                  functions behind row-level security, with{" "}
                  <code>auth.uid()</code> doing the auth. Two round trips and an
                  admin client became one RPC.
                </p>
              ),
            },
            {
              title: "A swipe is one transaction",
              body: (
                <p>
                  <code>record_swipe()</code> records the swipe, clears the feed
                  cache, checks for a match and opens the conversation, all or
                  nothing. Blocking later became one guard at the top of the
                  same function.
                </p>
              ),
            },
            {
              title: "497 KB down to 6 KB",
              body: (
                <p>
                  The landing page's one 3D shape started on Three.js. Rewritten
                  in raw WebGL it does the same job for a fraction of the bytes,
                  and with an agent writing it, the lower-level version cost no
                  more time.
                </p>
              ),
            },
            {
              title: "One table, not two",
              body: (
                <p>
                  For inviting a friend who isn't on the app yet, the agent
                  proposed a separate invites table. I added one nullable column
                  to friendships instead: one source of truth, no reconciliation
                  when they sign up.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection id="built" title="How I built it">
        <p>
          I spent more tokens planning than building. Explain the product,
          refine the journey, let the agent draft the schema, then tune it by
          hand before anything is built. That last step is never optional.
        </p>
        <p>
          I also wrote down what I got wrong: no shared colour config and no
          service layer, two habits I'd have had on day one writing it myself.
          The full story is in{" "}
          <Link to="/blogs/$slug" params={{ slug: "vibecoded-dating-app" }}>
            I Vibecoded a Full Stack App
          </Link>
          .
        </p>
      </CaseSection>

      <NextProject current="offlyn" />
    </>
  );
}
