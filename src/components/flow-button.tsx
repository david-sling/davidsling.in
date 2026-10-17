import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

/**
 * Secondary pill. Adapted from Spell UI's Flow Button: on hover a dashed
 * outline fades in and its dashes run around the edge. The original
 * measured itself in an effect (blank on the server); an SVG rect sized
 * in percentages needs no measurement.
 */
interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const FlowButton = React.forwardRef<HTMLButtonElement, FlowButtonProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <span className="group/flow relative inline-flex">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible opacity-0 transition-opacity duration-200 ease-out group-hover/flow:opacity-100"
        >
          <rect
            x="0.75"
            y="0.75"
            style={{ width: 'calc(100% - 1.5px)', height: 'calc(100% - 1.5px)' }}
            rx="23.25"
            fill="none"
            stroke="var(--blue-text)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="group-hover/flow:animate-[dash-flow_0.9s_linear_infinite] motion-reduce:animate-none"
          />
        </svg>
        <Comp
          ref={ref}
          data-motion="travel"
          className={cn(
            'relative inline-flex h-12 items-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold text-ink no-underline',
            'bg-sheet-sunk shadow-[inset_0_0_0_1px_var(--line)] transition-[background-color,transform,box-shadow] hover:shadow-none duration-200 ease-out-quart hover:bg-transparent',
            'origin-bottom active:scale-y-[0.94] active:duration-75',
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
      </span>
    )
  },
)
FlowButton.displayName = 'FlowButton'
