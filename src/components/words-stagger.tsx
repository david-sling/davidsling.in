import { cn } from '@/lib/utils'

/**
 * Spell UI's Words Stagger: each word rises out of blur in turn. Done in
 * CSS rather than motion so it runs from the server-rendered HTML with no
 * hidden-until-hydration gap. The full sentence is read once by screen
 * readers; reduced motion gets a plain fade (see styles.css).
 */
export function WordsStagger({
  text,
  className,
  delay = 0.1,
  stagger = 0.06,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
}) {
  const words = text.split(' ').filter(Boolean)
  return (
    <span className={cn('block', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="block">
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="words-stagger inline-block whitespace-pre"
            style={{ animationDelay: `${delay + i * stagger}s` }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  )
}
