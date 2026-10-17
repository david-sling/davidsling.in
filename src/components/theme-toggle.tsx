import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";
const KEY = "theme";

/**
 * Runs in <head> before paint so a saved choice never flashes the wrong
 * palette. With no saved choice the system setting decides (pure CSS).
 */
export const themeScript = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

function resolved(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Sun/moon switch. Flips the palette and remembers the choice on this device. */
export function ThemeToggle({ className }: { className?: string }) {
  // Unknown until mounted; the icon pair cross-fades once it is known.
  const [theme, setTheme] = React.useState<Theme | null>(null);

  React.useEffect(() => {
    setTheme(resolved());
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(resolved());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = resolved() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
    setTheme(next);
  }

  const dark = theme === "dark";
  const icon =
    "absolute transition-[opacity,transform] duration-300 ease-out-expo motion-reduce:transition-opacity";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === null ? undefined : dark}
      className={cn(
        "group/theme relative grid size-10 shrink-0 place-items-center rounded-full bg-sheet text-ink-2 shadow-[var(--shadow-tile)]",
        "transition-[transform,background-color,color] duration-150 ease-out-quart hover:bg-blue-wash hover:text-ink active:scale-[0.92]",
        className,
      )}
    >
      <SunIcon
        aria-hidden
        size={17}
        strokeWidth={2}
        className={cn(
          icon,
          "group-hover/theme:rotate-45",
          dark
            ? "scale-50 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
      <MoonIcon
        aria-hidden
        size={16}
        strokeWidth={2}
        className={cn(
          icon,
          "group-hover/theme:-rotate-12",
          dark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
