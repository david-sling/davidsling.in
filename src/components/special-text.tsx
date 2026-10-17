import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { useInView, useReducedMotion } from "motion/react";

/*
 * Spell UI's special-text scramble, adapted:
 * - text is split into graphemes, so Tamil vowel signs stay on their letters;
 * - the current text stays on screen until the scramble overwrites it, so
 *   nothing is ever blank at rest;
 * - changing `children` scrambles from the old text to the new one;
 * - reduced motion swaps letter by letter with no random glyphs;
 * - screen readers get `label` (the full text by default), never the noise.
 */

interface SpecialTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: string;
  speed?: number;
  delay?: number;
  inView?: boolean;
  once?: boolean;
  /** Scramble in on first render. Off means only later text changes animate. */
  animateOnMount?: boolean;
  /** What screen readers hear. Defaults to the text itself. */
  label?: string;
  /** Language of the visible text, when it differs from the page's. */
  textLang?: string;
}

const RANDOM_CHARS = "_!X$0-+*#";

function getRandomChar(prevChar?: string): string {
  let char: string;
  do {
    char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  } while (char === prevChar);
  return char;
}

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function graphemes(text: string): string[] {
  return segmenter
    ? Array.from(segmenter.segment(text), (s) => s.segment)
    : Array.from(text);
}

export function SpecialText({
  children: text,
  speed = 20,
  delay = 0,
  className = "",
  inView = false,
  once = true,
  animateOnMount = true,
  label,
  textLang,
  ...rest
}: SpecialTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once, margin: "-100px" });
  const reduce = useReducedMotion();
  const ready = inView ? isInView : true;
  const [displayText, setDisplayText] = useState(text);
  // What's on screen when the next run starts, so an interrupted run picks up from it.
  const shown = useRef(text);
  const first = useRef(true);

  useEffect(() => {
    if (!ready) return;
    const isFirst = first.current;
    first.current = false;
    if (isFirst && !animateOnMount) return;

    const from = graphemes(shown.current);
    const to = graphemes(text);
    const frames = reduce ? to.length : to.length * 4;
    let step = 0;
    let interval = 0;

    const tick = () => {
      let chars: string[];
      if (reduce) {
        chars = [...to.slice(0, step + 1), ...from.slice(step + 1, to.length)];
      } else if (step < to.length * 2) {
        // Phase 1: random glyphs spread over the old text from the left.
        const count = Math.min(step + 1, to.length);
        chars = [];
        for (let i = 0; i < count; i++) chars.push(getRandomChar(chars[i - 1]));
        for (let i = count; i < to.length; i++) chars.push(from[i] ?? " ");
      } else {
        // Phase 2: the new text resolves left to right behind a cursor.
        const s = step - to.length * 2;
        const revealed = Math.floor(s / 2);
        chars = to.slice(0, revealed);
        if (revealed < to.length) chars.push(s % 2 === 0 ? "_" : getRandomChar());
        while (chars.length < to.length) chars.push(getRandomChar());
      }
      step += 1;
      shown.current = step >= frames ? text : chars.join("");
      setDisplayText(shown.current);
      if (step >= frames) window.clearInterval(interval);
    };

    const start = window.setTimeout(
      () => {
        interval = window.setInterval(tick, reduce ? speed * 2 : speed);
      },
      isFirst ? delay * 1000 : 0,
    );
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [text, ready, reduce]);

  return (
    <span ref={containerRef} className={className} {...rest}>
      <span aria-hidden lang={textLang}>
        {displayText}
      </span>
      <span className="sr-only">{label ?? text}</span>
    </span>
  );
}
