import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** What's on the bench right now. Edit when it changes. */
export function NowBuilding({ className }: { className?: string }) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: "wave" }}
      hash="next"
      className={cn(
        "group/now flex items-center gap-3.5 rounded-[32px] bg-sheet px-5 py-4 no-underline shadow-[var(--shadow-tile)] transition-[box-shadow] duration-300 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue active:scale-[0.99] sm:px-6",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-full bg-sheet-sunk"
      >
        <img
          src="/media/wave/mark.webp"
          alt=""
          width={28}
          height={28}
          loading="lazy"
          className="size-7 origin-[70%_85%] transition-transform duration-300 ease-out-expo group-hover/now:-rotate-[14deg] motion-reduce:transition-none"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.85rem] font-semibold text-ink-2">
          Now building for Wave
        </span>
        <span className="block font-semibold leading-snug tracking-[-0.01em] text-ink">
          End-to-end encryption
        </span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 text-ink-3 transition-transform duration-300 ease-out-expo group-hover/now:translate-x-1 group-hover/now:text-ink"
      />
    </Link>
  );
}
