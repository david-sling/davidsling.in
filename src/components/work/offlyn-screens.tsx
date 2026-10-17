import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MoreVertical,
  SendHorizontal,
  User,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Three offlyn.love app screens, redrawn in code so every face matches the
 * rest of the page: the woman in white is the match, the photographer is
 * "you", and the mutual-friend avatar is Priya. All sample data.
 */
const pink = "bg-[#ff6b9f]";
const you = "/media/offlyn/person-you.webp";
const ananya = "/media/offlyn/person-ananya.webp";
const priya = "/media/offlyn/common-friend.webp";

function Phone({
  label,
  caption,
  children,
  tone = "light",
}: {
  label: string;
  caption: string;
  children: React.ReactNode;
  tone?: "light" | "pink";
}) {
  return (
    <figure className="group/screen m-0">
      <div
        role="img"
        aria-label={label}
        data-motion="travel"
        className={cn(
          "relative mx-auto flex aspect-[9/18.5] w-full max-w-[280px] flex-col overflow-hidden rounded-[30px] font-[system-ui] text-[#1d1d1f] shadow-[var(--shadow-tile)] ring-1 ring-[var(--line)]",
          "transition-[transform,box-shadow] duration-300 ease-out-expo group-hover/screen:-translate-y-1.5 group-hover/screen:shadow-[var(--shadow-lift)]",
          tone === "pink" ? cn(pink, "text-white") : "bg-white",
        )}
      >
        <div aria-hidden className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </div>
      <figcaption className="mx-auto mt-3 max-w-[280px] px-1 text-[0.9rem] font-medium text-ink-2">
        {caption}
      </figcaption>
    </figure>
  );
}

function TabBar({ active }: { active: "People" | "Chat" }) {
  return (
    <div className="mt-auto grid grid-cols-3 border-t border-black/5 bg-white px-2 pb-3 pt-2 text-[9px] font-semibold text-[#8e8e93]">
      {(
        [
          ["Profile", User],
          ["People", Users],
          ["Chat", MessageCircle],
        ] as const
      ).map(([name, Icon]) => (
        <span
          key={name}
          className={cn(
            "flex flex-col items-center gap-0.5",
            name === active && "text-[#1d1d1f]",
          )}
        >
          <Icon className="size-4" strokeWidth={name === active ? 2.6 : 2} />
          {name}
        </span>
      ))}
    </div>
  );
}

function PeopleScreen() {
  return (
    <Phone
      label="offlyn.love People screen: Ananya's profile card with like and pass buttons"
      caption="People: friends of your friends, one at a time"
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-[17px] font-bold">People</span>
        <span className="flex gap-0.5 rounded-full bg-[#f2f2f4] p-0.5">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full text-white",
              pink,
            )}
          >
            <Heart className="size-3" fill="currentColor" />
          </span>
          <span className="grid size-6 place-items-center text-[#a0a0a8]">
            <Users className="size-3" />
          </span>
        </span>
      </div>
      <div className="relative mx-3 min-h-0 flex-1 overflow-hidden rounded-[18px]">
        <img
          src={ananya}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover object-top"
        />
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,oklch(0_0_0/0.6))] px-3 pb-3 pt-10 text-white">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[17px] font-bold leading-tight">
                Ananya<span className="font-normal">, 26</span>
              </p>
              <p className="text-[10px] opacity-90">You both know someone</p>
            </div>
            <span className="flex gap-3">
              <X className="size-5" />
              <Heart className="size-5" fill="currentColor" />
            </span>
          </div>
        </div>
      </div>
      <div className="mx-3 my-3 rounded-[12px] border border-black/5 px-3 py-2">
        <p className="flex items-center gap-1 text-[9px] font-semibold text-[#ff6b9f]">
          <MessageCircle className="size-2.5" fill="currentColor" /> A perfect
          Sunday looks like
        </p>
        <p className="mt-0.5 text-[11px] font-semibold leading-snug">
          Cubbon Park at sunrise, then filter coffee.
        </p>
      </div>
      <TabBar active="People" />
    </Phone>
  );
}

function MatchScreen() {
  return (
    <Phone
      tone="pink"
      label="offlyn.love match screen: you and Ananya liked each other, and both of you know Priya"
      caption="A match names the friend you share"
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <ArrowLeft className="size-4" />
        <MoreVertical className="size-4" />
      </div>
      <p className="mt-6 text-center text-[22px] font-bold">It's a Match!</p>
      <p className="mt-1 text-center text-[11px] opacity-90">
        You and Ananya liked each other
      </p>
      <div className="relative mx-auto mt-6 flex w-[78%] items-start justify-center">
        {[
          [you, "-rotate-6 -mr-3", ""],
          [ananya, "rotate-6 mt-2", "Ananya"],
        ].map(([src, tilt, name]) => (
          <div
            key={src}
            className={cn(
              "w-1/2 rounded-[6px] bg-white p-1.5 pb-4 shadow-[0_10px_18px_-8px_oklch(0.3_0.1_0/0.5)]",
              tilt,
            )}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[3px] object-cover object-top"
            />
            {name && (
              <p className="mt-1 text-center text-[9px] font-semibold text-[#1d1d1f]">
                {name}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="mx-auto mt-6 flex items-center gap-1.5 rounded-full bg-white/25 py-1 pl-1 pr-3 text-[10px] font-medium">
        <img
          src={priya}
          alt=""
          loading="lazy"
          className="size-5 rounded-full object-cover"
        />
        Both of you know <b>Priya</b>
      </p>
      <p className="mt-4 text-center text-[11px] font-medium">
        Talk to Ananya about
      </p>
      <div className="mt-2 flex justify-center gap-1.5 text-[10px] font-medium">
        <span className="rounded-full border border-white/50 bg-white/15 px-2.5 py-1">
          Photography
        </span>
        <span className="rounded-full border border-white/50 bg-white/15 px-2.5 py-1">
          Indie music
        </span>
      </div>
      <div className="mt-auto flex items-center gap-2 bg-[#ff5590] px-3 py-3">
        <span className="flex-1 rounded-full bg-white/25 px-3 py-2 text-[10px] text-white/80">
          Say something to Ananya…
        </span>
        <SendHorizontal className="size-4 opacity-80" />
      </div>
    </Phone>
  );
}

function ChatScreen() {
  const bubble =
    "max-w-[78%] rounded-[14px] px-2.5 py-1.5 text-[10.5px] leading-snug";
  return (
    <Phone
      label="offlyn.love chat with Ananya, which opens on the friend you share, Priya"
      caption="The chat opens on that friend"
    >
      <div className="flex items-center gap-2 border-b border-black/5 px-4 pb-2.5 pt-4">
        <ArrowLeft className="size-4" />
        <img
          src={ananya}
          alt=""
          loading="lazy"
          className="size-6 rounded-full object-cover object-top"
        />
        <span className="text-[13px] font-semibold">Ananya</span>
        <MoreVertical className="ml-auto size-4" />
      </div>
      <div className="flex flex-col items-center px-4 pt-5 text-center">
        <img
          src={ananya}
          alt=""
          loading="lazy"
          className="size-14 rounded-full object-cover object-top"
        />
        <p className="mt-1.5 text-[13px] font-bold">Ananya</p>
        <p className="mt-0.5 text-[9px] text-[#8e8e93]">
          This is the start of your conversation with Ananya.
        </p>
        <p className="mt-2 flex items-center gap-1 rounded-full bg-[#fff0f5] px-2.5 py-1 text-[9px] font-semibold text-[#e0457f]">
          <Heart className="size-2.5" fill="currentColor" /> You matched through
          Priya
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-1.5 px-3 pb-2">
        <p className={cn(bubble, "self-end bg-[#f0f0f2]")}>
          Hi Ananya! Small world, I saw we both know Priya
        </p>
        <p className={cn(bubble, "self-start text-white", pink)}>
          Priya has told me exactly one embarrassing story about you already
        </p>
        <p className={cn(bubble, "self-end bg-[#f0f0f2]")}>
          She told me you're competitive. Scared and intrigued
        </p>
      </div>
      <div className="flex items-center gap-2 border-t border-black/5 px-3 py-2.5">
        <span className="flex-1 rounded-full bg-[#f2f2f4] px-3 py-2 text-[10px] text-[#a0a0a8]">
          Message…
        </span>
        <span
          className={cn(
            "grid size-7 place-items-center rounded-full text-white",
            pink,
          )}
        >
          <SendHorizontal className="size-3.5" />
        </span>
      </div>
    </Phone>
  );
}

export function OfflynScreens() {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      {[PeopleScreen, MatchScreen, ChatScreen].map((Screen, i) => (
        <div
          key={i}
          className="w-[64vw] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none"
        >
          <Screen />
        </div>
      ))}
    </div>
  );
}
