import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

/** What's on the bench right now. Edit when it changes. */
export function NowBuilding() {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: "wave" }}
      hash="next"
      className="group/now flex items-center gap-4 rounded-[32px] bg-sheet px-5 py-5 no-underline shadow-[var(--shadow-tile)] transition-[box-shadow] duration-300 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue active:scale-[0.99] sm:px-7"
    >
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--wave)]"
      >
        <span className="size-2.5 rounded-full bg-[var(--wave-deep)] motion-safe:animate-pulse" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.85rem] font-semibold text-ink-2">
          Now building
        </span>
        <span className="block text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
          End-to-end encryption for Wave
        </span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 text-ink-3 transition-transform duration-300 ease-out-expo group-hover/now:translate-x-1 group-hover/now:text-ink"
      />
    </Link>
  );
}
