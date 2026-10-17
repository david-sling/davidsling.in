import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CopyEmail } from "@/components/copy-button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/content";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#writing", label: "Writing" },
];

export function SiteHeader() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 bg-ground">
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between gap-1 px-4 sm:gap-4 sm:px-6">
        <Link
          to="/"
          className="group/mark flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full py-1 pr-2 text-[1.05rem] font-semibold tracking-[-0.01em] no-underline"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-blue text-[oklch(0.21_0.014_245)] transition-transform duration-300 ease-out-expo group-hover/mark:scale-105"
          >
            <Logo className="ml-0.5 h-3.5 transition-transform duration-300 ease-out-expo group-hover/mark:translate-x-[3px]" />
          </span>
          {/* On hover or focus the name rolls over to its Tamil spelling; the English stays the accessible name. */}
          <span className="grid overflow-hidden max-[420px]:sr-only">
            <span className="col-start-1 row-start-1 transition-[transform,opacity] duration-200 ease-out-expo group-hover/mark:-translate-y-full group-hover/mark:opacity-0 group-focus-visible/mark:-translate-y-full group-focus-visible/mark:opacity-0 motion-reduce:translate-y-0!">
              {site.name}
            </span>
            <span
              aria-hidden
              lang="ta"
              className="col-start-1 row-start-1 translate-y-full opacity-0 transition-[transform,opacity] duration-300 ease-out-expo group-hover/mark:translate-y-0 group-hover/mark:opacity-100 group-focus-visible/mark:translate-y-0 group-focus-visible/mark:opacity-100 motion-reduce:translate-y-0"
            >
              டேவிட் ஸ்லிங்
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
