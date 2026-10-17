import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Pill button. Press mechanics adapted from Spell UI's Pop Button
 * (squash toward the baseline on press); the arrow slides out and a
 * twin slides in on hover.
 */
type Variant = 'primary' | 'ink' | 'quiet'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  asChild?: boolean
  arrow?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-blue text-[oklch(0.21_0.014_245)] shadow-[0_1px_0_oklch(1_0_0/0.5)_inset,0_8px_20px_-8px_oklch(0.6_0.12_216/0.7)] hover:bg-blue-strong',
  ink: 'bg-ink text-sheet hover:bg-[color-mix(in_oklch,var(--ink)_88%,var(--blue))]',
  quiet: 'bg-sheet text-ink shadow-[var(--shadow-tile)] hover:bg-sheet-sunk',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', asChild, arrow = true, children, ...props }, ref) => {
    const classes = cn(
      'group/btn relative inline-flex h-12 select-none items-center gap-2.5 rounded-full pl-6 pr-5 text-[0.95rem] font-semibold no-underline',
      'origin-bottom transition-[transform,background-color,box-shadow] duration-150 ease-out-quart',
      'active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75',
      'disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      className,
    )
    const inner = (label: React.ReactNode) => (
      <>
        <span>{label}</span>
        {arrow ? <SlideArrow /> : null}
      </>
    )

    // asChild: the child element (a link) becomes the button, keeping its own props.
    if (asChild && React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)) {
      return React.cloneElement(
        children,
        { ...props, className: cn(classes, children.props.className), 'data-motion': 'travel' } as React.HTMLAttributes<HTMLElement>,
        inner(children.props.children),
      )
    }

    return (
      <button ref={ref} data-motion="travel" className={classes} {...props}>
        {inner(children)}
      </button>
    )
  },
)
Button.displayName = 'Button'

/** An arrow that nudges right when its button or link is hovered. */
export function SlideArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      className={cn(
        'size-4 shrink-0 transition-transform duration-200 ease-out-expo group-hover/btn:translate-x-1 group-hover/link:translate-x-1 motion-reduce:transition-none',
        className,
      )}
      strokeWidth={2.25}
    />
  )
}
