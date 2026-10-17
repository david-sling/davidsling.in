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
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
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
          <span className="max-[420px]:sr-only">{site.name}</span>
        </Link>

        <nav aria-label="Primary" onPointerLeave={() => setHovered(null)}>
          <ul className="flex items-center gap-0.5 p-0">
            {nav.map((item) => (
              <li key={item.href} className="list-none">
                <a
                  href={item.href}
                  onPointerEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onBlur={() => setHovered(null)}
                  className="relative block rounded-full px-3 py-2 text-[0.92rem] font-medium text-ink-2 no-underline transition-colors duration-150 hover:text-ink sm:px-4"
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
