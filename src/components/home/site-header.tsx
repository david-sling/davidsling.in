import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CopyEmail } from "@/components/copy-button";
import { Logo } from "@/components/logo";
import { SpecialText } from "@/components/special-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/content";

const TAMIL_NAME = "டேவிட் ஸ்லிங்";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#writing", label: "Writing" },
];

export function SiteHeader() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tamil, setTamil] = useState(false);

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
            className="grid size-9 place-items-center rounded-full bg-blue text-[oklch(0.21_0.014_245)] transition-transform duration-300 ease-out-expo group-hover/mark:scale-105"
          >
            <Logo className="ml-0.5 h-3.5 transition-transform duration-300 ease-out-expo group-hover/mark:translate-x-[3px]" />
          </span>
          {/* On hover or focus the name scrambles into its Tamil spelling; the English stays the accessible name.
              Both spellings size the cell invisibly, so the nav never shifts. */}
          <span className="grid whitespace-nowrap max-[420px]:sr-only">
            <span aria-hidden className="invisible col-start-1 row-start-1">{site.name}</span>
            <span aria-hidden lang="ta" className="invisible col-start-1 row-start-1">{TAMIL_NAME}</span>
            <SpecialText
              animateOnMount={false}
              speed={14}
              label={site.name}
              textLang={tamil ? "ta" : undefined}
              className="col-start-1 row-start-1 overflow-hidden"
            >
              {tamil ? TAMIL_NAME : site.name}
            </SpecialText>
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
