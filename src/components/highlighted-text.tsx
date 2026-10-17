import { useRef } from 'react'
import { useInView } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Spell UI's Highlighted Text, recoloured: a blue block sweeps in behind
 * the phrase when it scrolls into view. One in-view flag drives both the
 * block and the text colour through CSS transitions, so they can never
 * disagree; before hydration the phrase is plain ink.
 */
export function HighlightedText({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const on = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })

  return (
    <span ref={ref} data-on={on || undefined} className={cn('group/hl relative inline whitespace-nowrap px-[0.18em]', className)}>
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 inset-y-[0.04em] origin-left scale-x-0 rounded-[0.3em] bg-blue',
          'transition-transform duration-700 ease-out-expo group-data-[on]/hl:scale-x-100',
          'motion-reduce:scale-x-100 motion-reduce:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:group-data-[on]/hl:opacity-100',
        )}
      />
      <span className="relative text-ink transition-colors delay-150 duration-200 group-data-[on]/hl:text-[oklch(0.21_0.014_245)]">
        {children}
      </span>
    </span>
  )
}
