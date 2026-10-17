import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { CopyEmail } from "@/components/copy-button";
import { Logo } from "@/components/logo";
import { SpecialText } from "@/components/special-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/content";

const [FIRST, LAST] = site.name.split(" ");
const TAMIL_FIRST = "டேவிட்";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#writing", label: "Writing" },
];

export function SiteHeader() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tamil, setTamil] = useState(false);
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 bg-ground">
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between gap-1 px-4 sm:gap-4 sm:px-6">
        <Link
          to="/"
          onPointerEnter={() => setTamil(true)}
          onPointerLeave={() => setTamil(false)}
          onFocus={(e) => setTamil(e.currentTarget.matches(":focus-visible"))}
          onBlur={() => setTamil(false)}
          className="group/mark flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full py-1 pr-2 text-[1.05rem] font-semibold tracking-[-0.01em] no-underline"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-blue text-[oklch(0.21_0.014_245)]"
          >
            <Logo className="ml-0.5 h-3.5" />
          </span>
          {/* On hover or focus "David" scrambles into its Tamil spelling; "Sling" stays put in English.
              Both spellings size the cell invisibly, so the nav never shifts. */}
          <span className="grid whitespace-nowrap max-[420px]:sr-only">
            <span aria-hidden className="invisible col-start-1 row-start-1">{site.name}</span>
            <span aria-hidden className="invisible col-start-1 row-start-1">
              <span lang="ta">{TAMIL_FIRST}</span> {LAST}
            </span>
            <span className="col-start-1 row-start-1 flex">
              {/* The slot takes the final word's width up front, so "Sling" moves once, straight to
                  where it ends up, instead of following every scrambled frame. Wider noise frames are
                  clipped just short of the space, so they never run into "Sling". */}
              <span className="relative">
                <span aria-hidden lang={tamil ? "ta" : undefined} className="invisible">
                  {tamil ? TAMIL_FIRST : FIRST}
                </span>
                <SpecialText
                  animateOnMount={false}
                  speed={20}
                  label={FIRST}
                  textLang={tamil ? "ta" : undefined}
                  className="absolute inset-y-0 left-0 -right-[0.12em] overflow-hidden whitespace-nowrap"
                >
                  {tamil ? TAMIL_FIRST : FIRST}
                </SpecialText>
              </span>
              <motion.span
                layout="position"
                transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="ml-[0.28em]"
              >
                {LAST}
              </motion.span>
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" onPointerLeave={() => setHovered(null)}>
          <ul className="flex items-center p-0 sm:gap-0.5">
            {nav.map((item) => (
              <li key={item.href} className="list-none">
                <a
                  href={item.href}
                  onPointerEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onBlur={() => setHovered(null)}
                  className="relative flex min-h-11 items-center rounded-full px-2 text-[0.88rem] min-[400px]:px-3 sm:text-[0.92rem] font-medium text-ink-2 no-underline transition-colors duration-150 hover:text-ink sm:px-4"
                >
                  {hovered === item.href && (
                    <motion.span
                      layoutId="nav-hover"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-sheet shadow-[var(--shadow-tile)]"
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 40,
                      }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <CopyEmail email={site.email} className="hidden md:inline-flex" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
