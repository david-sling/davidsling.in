import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SlideArrow } from "@/components/button";
import { CopyEmail } from "@/components/copy-button";
import { HighlightedText } from "@/components/highlighted-text";
import { Pulse } from "@/components/home/pulse";
import { formatDate, posts, roles, site, stack } from "@/lib/content";
import { cn } from "@/lib/utils";

export function HowIBuild() {
  const artifacts = [
    "CLAUDE.md",
    "PRODUCT.md",
    "specs/",
    "impeccable",
    "Claude Code",
  ];
  return (
    <section
      aria-labelledby="build-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="rounded-[40px] bg-blue-wash px-5 py-14 sm:px-14 sm:py-20">
          <h2
            id="build-title"
            className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]"
          >
            How I build
          </h2>
          <p className="mt-8 max-w-[32ch] text-[clamp(1.3rem,2.2vw,1.85rem)] font-medium leading-[1.25] tracking-[-0.02em] text-ink-2">
            Most of my recent work was built with AI agents. I write the specs,
            the context files and the design rules, review every diff, and let
            agents write a lot of the code. On Wave,{" "}
            <HighlightedText>191 of 220 commits</HighlightedText> carry a Claude
            co-author line.
          </p>
          <ul
            className="mt-10 flex flex-wrap gap-2.5 p-0"
            aria-label="What a project of mine starts with"
          >
            {artifacts.map((a, i) => (
              <li
                key={a}
                data-motion="travel"
                style={
                  {
                    "--tilt": `${[-4, 3, -2, 4, -3][i]}deg`,
                  } as React.CSSProperties
                }
                className="list-none rounded-full bg-sheet px-4 py-2 text-[0.92rem] font-semibold shadow-[var(--shadow-tile)] [transform:rotate(var(--tilt))] hover:animate-[sticker-wobble_0.6s_var(--ease-out)]"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="sr-only">What I am up to right now</h3>
          <Pulse />
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="mx-auto grid max-w-[1240px] gap-10 px-4 pt-28 sm:px-6 sm:pt-36 lg:grid-cols-[1fr_1.6fr]"
    >
      <div>
        <h2
          id="experience-title"
          className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]"
        >
          Experience
        </h2>
        <p className="mt-4 max-w-[34ch] text-ink-2">
          Nearly five years of frontend, from a trademark search engine with
          12M+ records to leading a team.
        </p>
      </div>
      <ol className="m-0 p-0">
        {roles.map((r) => (
          <li
            key={r.title + r.company}
            className="grid list-none grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-line py-6 last:border-b"
          >
            <p className="text-[1.15rem] font-semibold tracking-[-0.01em]">
              {r.title} <span className="font-medium text-ink-3">at</span>{" "}
              {r.company}
            </p>
            <p className="tabular text-right text-[0.95rem] text-ink-3">
              {r.period}
            </p>
            <p className="col-span-2 max-w-[60ch] text-ink-2">{r.note}</p>
            {r.products && (
              <ul
                aria-label={`Products I built at ${r.company}`}
                className="col-span-2 mt-4 grid gap-2 p-0 sm:grid-cols-2"
              >
                {r.products.map((p) => (
                  <li key={p.name} className="list-none">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group/product flex h-full flex-col rounded-[20px] bg-sheet p-4 no-underline shadow-[var(--shadow-tile)] transition-[box-shadow,transform] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:translate-y-0 active:scale-[0.99]"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold tracking-[-0.01em]">
                          {p.name}
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-expo group-hover/product:-translate-y-0.5 group-hover/product:translate-x-0.5 group-hover/product:text-ink"
                        />
                      </span>
                      <span className="mt-0.5 text-[0.85rem] font-medium text-blue-text">
                        {p.role}
                      </span>
                      <span className="mt-2 text-[0.92rem] text-ink-2">
                        {p.summary}
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Stack() {
  return (
    <section
      aria-labelledby="stack-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <h2
        id="stack-title"
        className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]"
      >
        Tools I reach for
      </h2>
      <ul className="mt-10 grid grid-cols-3 gap-3 p-0 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {stack.map((s) => {
          const icon = s.icon;
          const lg = "size" in s && s.size === "lg";
          // Near-black brand marks would vanish in dark mode; they keep the ink colour.
          const dark =
            parseInt(icon.hex.slice(0, 2), 16) +
              parseInt(icon.hex.slice(2, 4), 16) <
            80;
          return (
            <li
              key={s.name}
              data-motion="travel"
              className={cn(
                "group/tile flex list-none flex-col items-center justify-center gap-3 rounded-[24px] bg-sheet shadow-[var(--shadow-tile)]",
                "transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
                lg ? "col-span-2 row-span-2 aspect-square" : "aspect-square",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className={cn(
                  "fill-ink-2 transition-[fill,transform] duration-300 ease-out-expo group-hover/tile:scale-110",
                  lg ? "size-16 sm:size-20" : "size-8 sm:size-9",
                )}
                style={
                  {
                    "--brand": dark ? "var(--ink)" : `#${icon.hex}`,
                  } as React.CSSProperties
                }
              >
                <path
                  d={icon.path}
                  className="group-hover/tile:fill-[var(--brand)]"
                />
              </svg>
              <span
                className={cn(
                  "font-medium text-ink-2",
                  lg ? "text-[1rem]" : "text-[0.8rem]",
                )}
              >
                {s.name}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Writing() {
  return (
    <section
      id="writing"
      aria-labelledby="writing-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <h2
        id="writing-title"
        className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]"
      >
        Writing
      </h2>
      <ul className="mt-10 grid gap-3 p-0">
        {posts.map((post) => (
          <li key={post.slug} className="list-none">
            <Link
              to="/blogs/$slug"
              params={{ slug: post.slug }}
              className="group/link grid gap-2 rounded-[24px] px-5 py-6 no-underline transition-[background-color,box-shadow] duration-200 hover:bg-sheet hover:shadow-[var(--shadow-tile)] sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-8 sm:px-7"
            >
              <time
                dateTime={post.date}
                className="tabular text-[0.95rem] text-ink-3"
              >
                {formatDate(post.date)}
              </time>
              <span>
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 text-[1.35rem] font-semibold tracking-[-0.015em] transition-[background-size] duration-500 ease-out-expo group-hover/link:bg-[length:100%_1.5px]">
                  {post.title}
                </span>
                <span className="mt-2 block max-w-[62ch] text-ink-2">
                  {post.summary}
                </span>
              </span>
              <SlideArrow className="hidden sm:inline-flex" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1240px] px-4 pb-6 pt-28 sm:px-6 sm:pt-36">
      <div className="rounded-[40px] bg-sheet px-6 py-16 text-center sm:px-14 sm:py-24">
        <h2 className="text-[clamp(3rem,9vw,6rem)] font-semibold leading-none tracking-[-0.04em]">
          Say hi.
        </h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-[1.1rem] text-ink-2">
          Not looking for a new role right now, but always up for talking about
          agents, interfaces or a good side project.
        </p>
        <div className="mt-10 flex justify-center">
          <CopyEmail email={site.email} size="lg" />
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-2 p-0">
          {site.socials.map((s) => (
            <li key={s.href} className="list-none">
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group/soc inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 font-medium text-ink-2 no-underline transition-colors duration-150 hover:bg-sheet-sunk hover:text-ink"
              >
                {s.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover/soc:-translate-y-0.5 group-hover/soc:translate-x-0.5 motion-reduce:transition-none"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 px-2 pt-6 text-center text-[0.88rem] text-ink-3 sm:flex-row sm:text-left">
        <p>
          © 2026 {site.name}, {site.location}
        </p>
        <p>Built with TanStack Start, General Sans and a lot of Claude.</p>
      </div>
    </footer>
  );
}
