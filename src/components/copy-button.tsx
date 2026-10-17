import * as React from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { TextMorph } from 'torph/react'
import { cn } from '@/lib/utils'

/**
 * Email pill with copy. The label morphs letter by letter between the
 * address and "Copied!" (Torph); the icon morph is Spell UI's Copy
 * Button. A polite live region announces the result.
 */
export function CopyEmail({
  email,
  className,
  size = 'md',
}: {
  email: string
  className?: string
  size?: 'md' | 'lg'
}) {
  const [copied, setCopied] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(email)
      setFailed(false)
      setCopied(true)
    } catch {
      setFailed(true)
    }
    timer.current = setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 1800)
  }

  const iconSize = size === 'lg' ? 20 : 16

  return (
    <button
      type="button"
      onClick={copy}
      data-motion="travel"
      className={cn(
        'group/copy relative inline-flex select-none items-center rounded-full bg-sheet font-medium text-ink shadow-[var(--shadow-tile)]',
        'transition-[transform,background-color,box-shadow] duration-150 ease-out-quart hover:bg-blue-wash active:scale-[0.97]',
        size === 'lg' ? 'h-16 gap-3.5 pl-7 pr-3 text-xl' : 'h-11 gap-2.5 pl-4 pr-2 text-[0.9rem]',
        className,
      )}
    >
      <TextMorph as="span" duration={420} className="whitespace-nowrap">
        {copied ? 'Copied!' : email}
      </TextMorph>
      <span
        aria-hidden
        className={cn(
          'relative grid place-items-center rounded-full bg-sheet-sunk text-ink-2 transition-colors duration-150 group-hover/copy:bg-blue group-hover/copy:text-[oklch(0.21_0.014_245)]',
          size === 'lg' ? 'size-10' : 'size-7',
        )}
      >
        <CheckIcon
          size={iconSize}
          strokeWidth={2.25}
          className={cn(
            'transition-[opacity,filter,transform] duration-200',
            copied ? 'scale-100 opacity-100 blur-0' : 'scale-50 opacity-0 blur-[2px]',
          )}
        />
        <CopyIcon
          size={iconSize - 2}
          strokeWidth={2}
          className={cn(
            'absolute transition-[opacity,filter,transform] duration-200',
            copied ? 'scale-0 opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-0',
          )}
        />
      </span>
      <span className="sr-only">Copy email address</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Email address copied' : failed ? `Could not copy. The address is ${email}` : ''}
      </span>
    </button>
  )
}
