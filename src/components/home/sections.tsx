import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { SlideArrow } from "@/components/button";
import { CopyEmail } from "@/components/copy-button";
import { HighlightedText } from "@/components/highlighted-text";
import { Pulse } from "@/components/home/pulse";
import { companyLinks, formatDate, roles, site, stack } from "@/lib/content";
import type { Post } from "@/lib/posts";
import type { Role } from "@/lib/content";
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
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="rounded-[40px] bg-blue-wash px-5 py-10 sm:px-10 sm:py-12">
          <h2
            id="build-title"
            className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]"
          >
            How I build
          </h2>
          <p className="mt-6 max-w-[32ch] text-[clamp(1.3rem,2.2vw,1.85rem)] font-medium leading-[1.25] tracking-[-0.02em] text-ink-2">
            Most of my recent work was built with AI agents. I write the specs,
            the context files and the design rules, review every diff, and let
            agents write a lot of the code. On{" "}
            <a
              href="https://github.com/david-sling/wave/commits/main"
              target="_blank"
              rel="noreferrer"
              className="rounded-sm text-ink underline decoration-[color-mix(in_oklch,var(--ink)_30%,transparent)] decoration-2 underline-offset-[0.18em] transition-[text-decoration-color] duration-150 hover:decoration-[var(--wave)]"
            >
              Wave
              <span className="sr-only">
                {" "}
                commits on GitHub (opens in a new tab)
              </span>
            </a>
            , <HighlightedText>191 of 220 commits</HighlightedText> carry a
            Claude co-author line.
          </p>
          <ul
            className="mt-8 flex flex-wrap gap-2.5 p-0"
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
      <div className="lg:sticky lg:top-28 lg:self-start">
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
        <a
          href="/resume"
          target="_blank"
          rel="noreferrer"
          className="group/cv mt-6 inline-flex min-h-11 select-none items-center gap-2.5 rounded-full bg-sheet pl-4 pr-5 font-semibold no-underline shadow-[var(--shadow-tile)] transition-[box-shadow,transform] duration-200 ease-out-quart hover:shadow-[var(--shadow-lift)] active:scale-[0.98] active:duration-75"
        >
          <FileText
            aria-hidden
            className="size-4 text-blue-text transition-transform duration-300 ease-out-expo group-hover/cv:-rotate-6"
          />
          Resume
          <ArrowUpRight
            aria-hidden
            className="size-4 text-ink-3 transition-transform duration-200 ease-out-expo group-hover/cv:-translate-y-0.5 group-hover/cv:translate-x-0.5 group-hover/cv:text-ink"
          />
          <span className="sr-only">(PDF, opens in a new tab)</span>
        </a>
      </div>
      <ol className="m-0 p-0">
        {companies.map((c) => (
          <li
            key={c.company}
            className="list-none border-t border-line py-7 last:border-b"
          >
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="text-[1.4rem] font-semibold tracking-[-0.02em]">
                {companyLinks[c.company] ? (
                  <a
                    href={companyLinks[c.company]}
                    target="_blank"
                    rel="noreferrer"
                    className="group/co -mx-1 -my-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 no-underline decoration-2 underline-offset-[0.2em] transition-colors duration-150 hover:text-blue-text hover:underline"
                  >
                    {c.company}
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 text-ink-3 transition-transform duration-200 ease-out-expo group-hover/co:-translate-y-0.5 group-hover/co:translate-x-0.5 group-hover/co:text-blue-text"
                    />
                    <span className="sr-only">
                      {" "}
                      on LinkedIn (opens in a new tab)
                    </span>
                  </a>
                ) : (
                  c.company
                )}
              </h3>
              <p className="tabular text-[0.95rem] text-ink-3">{c.period}</p>
            </div>
            <ol
              className={cn(
                "m-0 mt-4 p-0",
                // Several roles at one company read as a ladder: a line joins the dots.
                c.roles.length > 1 &&
                  "relative before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-line",
              )}
            >
              {c.roles.map((r) => (
                <li
                  key={r.title}
                  className={cn(
                    "relative list-none",
                    c.roles.length > 1 && "pl-7 [&+&]:mt-5",
                  )}
                >
                  {c.roles.length > 1 && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.45rem] size-[11px] rounded-full border-2 border-ground bg-blue"
                    />
                  )}
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="font-semibold tracking-[-0.01em]">
                      {r.title}
                    </p>
                    {c.roles.length > 1 && (
                      <p className="tabular text-[0.88rem] text-ink-3">
                        {r.period}
                      </p>
                    )}
                  </div>
                  <p className="mt-1 max-w-[60ch] text-ink-2">{r.note}</p>
                  {r.products && (
                    <Products company={c.company} products={r.products} />
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Roles are listed newest first; group the consecutive ones that share a company. */
const companies = roles.reduce<
  { company: string; period: string; roles: Role[] }[]
>((groups, r) => {
  const last = groups.at(-1);
  if (last?.company === r.company) {
    last.roles.push(r);
    // Earliest start of the group, latest end stays from its first role.
    last.period = `${r.period.split("–")[0]}–${last.period.split("–")[1]}`;
  } else {
    groups.push({ company: r.company, period: r.period, roles: [r] });
  }
  return groups;
}, []);

function Products({
  company,
  products,
}: {
  company: string;
  products: NonNullable<Role["products"]>;
}) {
  return (
    <ul
      aria-label={`Products I built at ${company}`}
      className="mt-4 grid gap-2 p-0 sm:grid-cols-2"
    >
      {products.map((p) => {
        const inner = (
          <>
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                {p.logo && (
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-white shadow-[0_0_0_1px_var(--line)] transition-transform duration-200 ease-out-expo group-hover/product:-rotate-6"
                  >
                    <img
                      src={p.logo}
                      alt=""
                      width={26}
                      height={26}
                      loading="lazy"
                      className="size-[26px] object-contain"
                    />
                  </span>
                )}
                <span className="font-semibold tracking-[-0.01em]">
                  {p.name}
                </span>
              </span>
              {p.caseStudy ? (
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-expo group-hover/product:translate-x-0.5 group-hover/product:text-ink"
                />
              ) : (
                <ArrowUpRight
                  aria-hidden
                  className="size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-expo group-hover/product:-translate-y-0.5 group-hover/product:translate-x-0.5 group-hover/product:text-ink"
                />
              )}
            </span>
            <span className="mt-0.5 text-[0.85rem] font-medium text-blue-text">
              {p.role}
            </span>
            <span className="mt-2 text-[0.92rem] text-ink-2">{p.summary}</span>
          </>
        );
        const cls =
          "group/product flex h-full flex-col rounded-[20px] bg-sheet p-4 no-underline shadow-[var(--shadow-tile)] transition-[box-shadow,transform] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:translate-y-0 active:scale-[0.99]";
        return (
          <li key={p.name} className="list-none">
            {p.caseStudy ? (
              <Link
                to="/work/$slug"
                params={{ slug: p.caseStudy }}
                className={cls}
              >
                {inner}
                <span className="sr-only">(read the case study)</span>
              </Link>
            ) : (
              <a href={p.url} target="_blank" rel="noreferrer" className={cls}>
                {inner}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Logos whose brand is more than one colour, drawn in the simple-icons 24×24
 * box so they line up exactly with the outline they replace on hover.
 */
const fullColour: Record<string, (path: string) => React.ReactNode> = {
  // Figma's five shapes, stretched to the outline's bounds (x 3.66–20.34).
  Figma: () => (
    <g transform="translate(3.658 0) scale(0.439 0.421)">
      <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
      <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
      <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
      <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
      <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
    </g>
  ),
  // The blue elephant: its silhouette (the path's first contour) under white linework.
  Postgres: (path) => (
    <>
      <path
        d={path.slice(0, path.search(/z/i) + 1)}
        fill="#336791"
        stroke="#1b1b1b"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      <path d={path} fill="#fff" />
    </>
  ),
  // TanStack's sky, from the gradient in its own logo.
  TanStack: (path) => (
    <>
      <defs>
        <linearGradient id="tanstack-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6bdaff" />
          <stop offset="0.319" stopColor="#f9ffb5" />
          <stop offset="0.706" stopColor="#ffa770" />
          <stop offset="1" stopColor="#ff7373" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#tanstack-sky)" />
    </>
  ),
};

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
                  "overflow-visible fill-ink-2 transition-transform duration-300 ease-out-expo group-hover/tile:scale-110",
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
                  className={cn(
                    "transition-[fill,opacity] duration-300 ease-out-expo",
                    // Multi-colour marks swap the outline for their full logo.
                    s.name in fullColour
                      ? "group-hover/tile:opacity-0"
                      : "group-hover/tile:fill-[var(--brand)]",
                  )}
                />
                {s.name in fullColour && (
                  <g className="opacity-0 transition-opacity duration-300 ease-out-expo group-hover/tile:opacity-100">
                    {fullColour[s.name](icon.path)}
                  </g>
                )}
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

/** The latest posts on the home page; the rest are one click away at /blogs. */
export function Writing({ posts }: { posts: Post[] }) {
  return (
    <section
      id="writing"
      aria-labelledby="writing-title"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          id="writing-title"
          className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]"
        >
          Writing
        </h2>
        {posts.length > 3 && (
          <Link
            to="/blogs"
            className="group/btn inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold no-underline transition-colors duration-150 hover:bg-sheet"
          >
            All {posts.length} posts
            <SlideArrow />
          </Link>
        )}
      </div>
      <PostList posts={posts.slice(0, 3)} className="mt-10" />
    </section>
  );
}

export function PostList({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3 p-0", className)}>
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
              <span className="tabular mt-2 block text-[0.88rem] text-ink-3">
                {post.minutes} min read
              </span>
            </span>
            <SlideArrow className="hidden sm:inline-flex" />
          </Link>
        </li>
      ))}
    </ul>
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
