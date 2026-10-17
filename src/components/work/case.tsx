import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import { SlideArrow } from "@/components/button";
import { projects, type Project, type ProjectSlug } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * The frame every case study shares: a project-colour hero, two-column
 * sections (sticky heading, prose), a decisions list and a door to the
 * next project. Each project adds one signature element of its own.
 */

/** Text colours that hold up on a project's own colour field. */
export const onField = (slug: ProjectSlug) => ({
  color: `var(--${slug}-deep)`,
  "--muted": `color-mix(in oklch, var(--${slug}-deep) 72%, var(--${slug}))`,
});

export function CaseHero({
  project,
  facts,
  media,
  jump,
}: {
  project: Project;
  facts: { label: string; value: string }[];
  media: React.ReactNode;
  /** An in-page shortcut beside the outbound links, e.g. to a live demo. */
  jump?: { label: string; href: string };
}) {
  return (
    <section
      aria-labelledby="case-title"
      className="mx-auto max-w-[1240px] px-4 sm:px-6"
    >
      <div
        className="grid gap-10 overflow-hidden rounded-[40px] px-6 pb-8 pt-8 sm:px-12 sm:pb-12 sm:pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12"
        style={
          {
            background: `var(--${project.slug})`,
            ...onField(project.slug),
          } as React.CSSProperties
        }
      >
        <div>
          <Link
            to="/"
            hash="work"
            className="group/back -ml-4 inline-flex min-h-11 items-center gap-2 rounded-full pl-4 pr-4 text-[0.92rem] font-semibold no-underline transition-colors duration-150 hover:bg-[oklch(1_0_0/0.35)]"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-300 ease-out-expo group-hover/back:-translate-x-1"
            />
            All work
          </Link>
          <h1
            id="case-title"
            className="mt-8 text-[clamp(2.8rem,6.4vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.04em] [text-wrap:balance]"
          >
            {project.name}
          </h1>
          <p className="mt-5 max-w-[36ch] text-[clamp(1.12rem,1.5vw,1.35rem)] font-medium leading-snug">
            {project.summary}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:max-w-[30rem]">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[0.82rem] font-medium text-[var(--muted)]">
                  {f.label}
                </dt>
                <dd className="m-0 mt-0.5 font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {project.links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                data-motion="travel"
                className={cn(
                  "group/out inline-flex h-12 select-none items-center gap-2 rounded-full pl-6 pr-5 font-semibold no-underline",
                  "origin-bottom transition-[transform,background-color] duration-150 ease-out-quart active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75",
                  i === 0
                    ? "bg-[var(--deep)] text-[var(--field)] hover:bg-[color-mix(in_oklch,var(--deep)_86%,var(--field))]"
                    : "bg-[oklch(1_0_0/0.55)] hover:bg-[oklch(1_0_0/0.8)]",
                )}
                style={
                  {
                    "--deep": `var(--${project.slug}-deep)`,
                    "--field": `var(--${project.slug})`,
                  } as React.CSSProperties
                }
              >
                {l.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover/out:-translate-y-0.5 group-hover/out:translate-x-0.5"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
            {jump && (
              <a
                href={jump.href}
                data-motion="travel"
                className="group/jump inline-flex h-12 select-none items-center gap-2 rounded-full border-2 border-[var(--deep)]/25 pl-6 pr-5 font-semibold no-underline origin-bottom transition-[transform,background-color,border-color] duration-150 ease-out-quart hover:border-[var(--deep)]/60 hover:bg-[oklch(1_0_0/0.3)] active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75"
                style={
                  {
                    "--deep": `var(--${project.slug}-deep)`,
                  } as React.CSSProperties
                }
              >
                {jump.label}
                <ArrowDown
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover/jump:translate-y-0.5"
                />
              </a>
            )}
          </div>
        </div>
        <div className="min-w-0">{media}</div>
      </div>
    </section>
  );
}

export function CaseSection({
  id,
  title,
  divider,
  children,
  wide,
}: {
  id: string;
  title: string;
  /** Something drawn above the section instead of plain space (Wave's "joined" lines). */
  divider?: React.ReactNode;
  children: React.ReactNode;
  /** Full-width material under the prose: a video, a demo, screenshots. */
  wide?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto max-w-[1240px] px-4 pt-24 sm:px-6 sm:pt-32"
    >
      {divider}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
        <h2
          id={id}
          className="text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] [text-wrap:balance] lg:sticky lg:top-28 lg:self-start"
        >
          {title}
        </h2>
        <div className="case-prose max-w-[64ch]">{children}</div>
      </div>
      {wide && <div className="mt-12">{wide}</div>}
    </section>
  );
}

/** Judgement calls as ruled rows, not cards. */
export function Decisions({
  items,
}: {
  items: { title: string; body: React.ReactNode }[];
}) {
  return (
    <ul className="m-0 mt-8 p-0">
      {items.map((d) => (
        <li
          key={d.title}
          className="list-none border-t border-line py-6 last:border-b"
        >
          <h3 className="text-[1.15rem] font-semibold tracking-[-0.01em] text-ink">
            {d.title}
          </h3>
          <div className="mt-2 text-ink-2">{d.body}</div>
        </li>
      ))}
    </ul>
  );
}

export function NextProject({ current }: { current: ProjectSlug }) {
  const i = projects.findIndex((p) => p.slug === current);
  const next = projects[(i + 1) % projects.length];
  return (
    <nav
      aria-label="More work"
      className="mx-auto max-w-[1240px] px-4 pt-28 sm:px-6 sm:pt-36"
    >
      <Link
        to="/work/$slug"
        params={{ slug: next.slug }}
        className="group/link flex flex-col gap-6 rounded-[40px] px-6 py-10 no-underline transition-transform duration-300 ease-out-expo sm:flex-row sm:items-end sm:justify-between sm:px-12 sm:py-14"
        style={
          {
            background: `var(--${next.slug})`,
            ...onField(next.slug),
          } as React.CSSProperties
        }
      >
        <div>
          <p className="font-semibold text-[var(--muted)]">Next project</p>
          <p className="mt-2 text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-none tracking-[-0.04em]">
            {next.name}
          </p>
          <p className="mt-4 max-w-[44ch] font-medium">{next.summary}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 font-semibold">
          Read the case study
          <SlideArrow />
        </span>
      </Link>
    </nav>
  );
}
