import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, CheckIcon, CopyIcon, FileText } from 'lucide-react'
import { siGithub, siInstagram } from 'simple-icons'
import { Button } from '@/components/button'
import { FlowButton } from '@/components/flow-button'
import { Pendulum } from '@/components/pendulum'
import { WordsStagger } from '@/components/words-stagger'
import { useJson, type Load } from '@/components/home/pulse'
import { site } from '@/lib/content'
import { cn } from '@/lib/utils'
import type { GithubPulse } from '@/routes/api/github'

/*
 * The landing hero: the intro card on the left and, from sm up, a 3×3 grid
 * of projects, the Equanim playground, a post, the resume, socials and email.
 * Phones get the intro card alone, with social icons under the buttons.
 */

const HEADLINE = 'Engineer with a designer’s eye.'
const SUB = 'I build real products with AI agents, and sweat the details they miss.'

const LINKEDIN =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.847 3.37-1.847 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
const iconPath: Record<string, string> = {
  GitHub: siGithub.path,
  LinkedIn: LINKEDIN,
  Instagram: siInstagram.path,
}

// Project cards: the page's sheet in light mode, near-black in dark mode.
const projectCard =
  'isolate bg-sheet text-ink dark:bg-[oklch(0.21_0.014_245)] dark:text-[oklch(0.95_0.006_225)]'

// The soft circle that follows the pointer on project cards and social rows.
const SPOT = '280px circle at var(--mx, 50%) var(--my, 50%)'
const spotMask = `radial-gradient(${SPOT}, #000, transparent 70%)`

/** Tracks the pointer in CSS variables so a card's glow can follow it. */
function trackPointer(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/** A soft circle of the project's colour under the pointer, shown on hover. */
function Glow({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 ease-out-expo group-hover/t:opacity-100 group-hover/t:duration-500 dark:group-hover/t:opacity-55"
      style={{
        background: `radial-gradient(${SPOT}, color-mix(in oklab, ${color} 38%, transparent), transparent 70%)`,
      }}
    />
  )
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue'

function Headline({ className, stagger = true }: { className?: string; stagger?: boolean }) {
  return (
    <h1
      id="hero-title"
      className={cn(
        'font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]',
        className,
      )}
    >
      {stagger ? <WordsStagger text={HEADLINE} delay={0.15} /> : HEADLINE}
    </h1>
  )
}

function Sub({ className, children = SUB }: { className?: string; children?: React.ReactNode }) {
  return (
    <p
      className={cn(
        'text-[clamp(1.05rem,1.6vw,1.3rem)] font-medium leading-snug tracking-[-0.01em] text-ink-3',
        className,
      )}
    >
      {children}
    </p>
  )
}

function Actions({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Button asChild>
        <a href="#work">See the work</a>
      </Button>
      <FlowButton asChild>
        <a href="#writing">Read the writing</a>
      </FlowButton>
    </div>
  )
}

function SocialIcon({ label, className }: { label: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn('size-5 fill-current', className)}>
      <path d={iconPath[label]} />
    </svg>
  )
}

const bentoTile =
  'group/t relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-[28px] p-5 lg:p-4 xl:p-5 no-underline shadow-[var(--shadow-tile)] transition-[transform,box-shadow,background-color,color] duration-200 ease-out-expo hover:duration-500 hover:shadow-[var(--shadow-lift)] active:scale-[0.985] active:duration-100 motion-reduce:active:scale-100'

function TileArrow({ external }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight
  return (
    <Icon
      aria-hidden
      className={cn(
        'size-5 shrink-0 opacity-60 transition-[transform,opacity] duration-200 ease-out-expo group-hover/t:opacity-100 group-hover/t:duration-500 motion-reduce:group-hover/t:translate-x-0 motion-reduce:group-hover/t:translate-y-0',
        external ? 'group-hover/t:-translate-y-1 group-hover/t:translate-x-1' : 'group-hover/t:translate-x-1',
      )}
    />
  )
}

const brandFill: Record<string, string> = {
  GitHub: 'bg-[#24292f]',
  LinkedIn: 'bg-[#0a66c2]',
  Instagram: 'bg-[linear-gradient(45deg,#feda75_0%,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5_100%)]',
}

// GitHub's own contribution greens, levels 0–4, from its light and dark themes.
const githubGreen = [
  'bg-[#ebedf0] dark:bg-[#161b22]',
  'bg-[#9be9a8] dark:bg-[#0e4429]',
  'bg-[#40c463] dark:bg-[#006d32]',
  'bg-[#30a14e] dark:bg-[#26a641]',
  'bg-[#216e39] dark:bg-[#39d353]',
]

/** The last few weeks of contributions as an edge-to-edge grid: no gaps, no rounding. */
function HeatFill({ state }: { state: Load<GithubPulse> }) {
  const box = useRef<HTMLSpanElement>(null)
  // As many weeks as fit with square cells: each cell is a seventh of the height.
  const [weeks, setWeeks] = useState(14)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setWeeks(Math.max(4, Math.round(el.clientWidth / (el.clientHeight / 7))))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const days = state.status === 'ready' ? state.data.days : []
  // Whole weeks ending today, so the last column is the current week.
  const last = days.length ? new Date(days.at(-1)!.date + 'T00:00:00Z').getUTCDay() : 6
  const recent = days.slice(-((weeks - 1) * 7 + last + 1))
  // Pad the front so each column is one Sunday-first week, as on GitHub.
  const lead = recent.length ? new Date(recent[0].date + 'T00:00:00Z').getUTCDay() : 0
  const cells = [...Array(lead).fill(0), ...recent.map((d) => d.level)]
  return (
    <span ref={box} className="absolute inset-0 grid auto-cols-fr grid-flow-col grid-rows-7 bg-[#ebedf0] dark:bg-[#161b22]">
      {cells.map((level, i) => (
        <span key={i} className={githubGreen[level] ?? githubGreen[0]} />
      ))}
    </span>
  )
}

function SocialsTile({ github }: { github: Load<GithubPulse> }) {
  return (
    <ul className="m-0 flex h-full flex-col divide-y divide-line overflow-hidden rounded-[28px] bg-sheet p-0 text-ink shadow-[var(--shadow-tile)]">
      {site.socials.map((s) => (
        <li key={s.href} className="flex flex-1 list-none">
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer"
            onPointerMove={trackPointer}
            className={cn(
              'group/t relative isolate flex min-h-[96px] flex-1 flex-col justify-between gap-2 overflow-hidden px-4 py-3.5 no-underline',
              focusRing,
              'focus-visible:outline-offset-[-4px]',
            )}
          >
            {/* The brand colour (or GitHub's heatmap) shows only inside a soft circle under the pointer. */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0 transition-opacity duration-200 ease-out-expo group-hover/t:opacity-100 group-hover/t:duration-500 group-focus-visible/t:opacity-100',
                brandFill[s.label],
              )}
              style={{ maskImage: spotMask, WebkitMaskImage: spotMask }}
            >
              {s.label === 'GitHub' && <HeatFill state={github} />}
            </span>
            <span className="relative flex items-start justify-between">
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl bg-sheet-sunk text-ink shadow-[inset_0_0_0_1px_var(--line)] transition-[transform,background-color,color,box-shadow] duration-200 ease-out-expo group-hover/t:duration-500 group-hover/t:-rotate-6 group-hover/t:scale-110 motion-reduce:group-hover/t:transform-none')}>
                <SocialIcon label={s.label} className="size-[18px]" />
              </span>
              <TileArrow external />
            </span>
            <span className="relative block truncate text-[1.05rem] font-semibold leading-tight tracking-[-0.015em] transition-transform duration-200 ease-out-expo group-hover/t:translate-x-1 group-hover/t:duration-500 motion-reduce:group-hover/t:translate-x-0">{s.label}</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}


function PlaygroundTile() {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: 'equanim' }}
      hash="playground"
      onPointerMove={trackPointer}
      className={cn(bentoTile, projectCard, focusRing)}
    >
      <Glow color="var(--equanim)" />
      {/* The pendulum draws in dark ink: faded on light, inverted to a light trace on dark. */}
      <Pendulum bob={5} className="absolute inset-0 size-full translate-x-[14%] -translate-y-[14%] opacity-30 dark:invert transition-opacity duration-200 group-hover/t:opacity-50 group-hover/t:duration-500" />
      <span className="relative flex justify-end"><TileArrow /></span>
      <span className="relative block">
        <span className="block text-[0.8rem] font-semibold text-ink-3">Playground</span>
        <span className="block text-[1.3rem] font-semibold tracking-[-0.02em] text-[var(--equanim-text)]">Equanim</span>
      </span>
    </Link>
  )
}

function SayHiTile() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy() {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(site.email)
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
  return (
    <div className="relative flex h-full min-h-[148px] flex-col justify-between rounded-[28px] bg-[color-mix(in_oklch,var(--blue)_14%,transparent)] p-5 text-ink shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--blue)_35%,transparent)] lg:p-4 xl:p-5">
      <span className="flex items-start justify-between gap-2">
        <span className="text-[1.3rem] font-semibold tracking-[-0.02em]">Say hi</span>
        <button
          type="button"
          onClick={copy}
          className="group/copy relative grid size-11 shrink-0 place-items-center rounded-full bg-blue text-[oklch(0.21_0.014_245)] transition-[transform,background-color] duration-150 ease-out-quart hover:scale-105 hover:bg-blue-strong active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <CheckIcon aria-hidden size={18} strokeWidth={2.25} className={cn('transition-[opacity,filter,transform] duration-200', copied ? 'scale-100 opacity-100 blur-0' : 'scale-50 opacity-0 blur-[2px]')} />
          <CopyIcon aria-hidden size={16} strokeWidth={2} className={cn('absolute transition-[opacity,filter,transform] duration-200', copied ? 'scale-0 opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-0')} />
          <span className="sr-only">Copy email address</span>
        </button>
      </span>
      <span className="block">
        <span className="block text-[0.85rem] font-medium text-blue-text">{copied ? 'Copied!' : 'Email me'}</span>
        <a
          href={`mailto:${site.email}`}
          className="mt-0.5 block rounded-sm font-semibold leading-snug underline decoration-[color-mix(in_oklch,var(--blue)_55%,transparent)] decoration-2 underline-offset-4 transition-[text-decoration-color,color] duration-150 hover:text-blue-text hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {site.email.split('@')[0]}@<wbr />{site.email.split('@')[1]}
        </a>
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Email address copied' : failed ? `Could not copy. The address is ${site.email}` : ''}
      </span>
    </div>
  )
}

export function Hero() {
  const github = useJson<GithubPulse>('/api/github')
  return (
    <section aria-labelledby="hero-title" className="relative mx-auto max-w-[1240px] px-4 pt-4 sm:px-6">
      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col items-center justify-end overflow-hidden rounded-[40px] bg-sheet text-center sm:items-start sm:text-left px-7 pb-10 pt-12 shadow-[0_1px_0_oklch(1_0_0/0.7)_inset] sm:px-11 lg:pb-9 lg:pt-8">
        {/* Scaled from its bottom-left on desktop; the negative margin gives back the space the scale frees. */}
        <div className="origin-bottom-left lg:-mt-[34px] lg:scale-[0.85]">
          <Portrait />
        </div>
        <Headline className="mt-8 max-w-[13ch] text-[clamp(2.4rem,min(4.4vw,8vh),4.25rem)] lg:mt-5 lg:text-[clamp(2.4rem,min(3.8vw,7vh),3.75rem)]" />
        <Sub className="mt-4 max-w-[32ch] lg:mt-3" />
        <Actions className="mt-8 justify-center sm:justify-start lg:mt-6" />
        <ul className="m-0 mt-7 flex justify-center gap-2 p-0 sm:hidden">
          {site.socials.map((s) => (
            <li key={s.href} className="list-none">
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.label} (opens in a new tab)`}
                className={cn(
                  'group/t relative grid size-12 place-items-center overflow-hidden rounded-full bg-sheet-sunk text-ink-2 shadow-[inset_0_0_0_1px_var(--line)] transition-[color,transform] duration-150 active:scale-90 active:text-white',
                  focusRing,
                )}
              >
                <span
                  aria-hidden
                  className={cn('absolute inset-0 opacity-0 transition-opacity duration-150 group-active/t:opacity-100', brandFill[s.label])}
                />
                <SocialIcon label={s.label} className="relative size-5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ul className="m-0 hidden grid-cols-3 gap-3 p-0 sm:grid">
        <li className="list-none sm:row-span-2">
          <Link to="/work/$slug" params={{ slug: 'wave' }} onPointerMove={trackPointer} className={cn(bentoTile, projectCard, focusRing)}>
            <Glow color="var(--wave)" />
            <span className="flex justify-end"><TileArrow /></span>
            <span className="flex flex-1 items-center justify-center py-2">
              <img src="/media/wave/mark.webp" alt="" width={160} height={160} className="size-20 origin-[70%_85%] drop-shadow-[0_14px_22px_oklch(0.85_0.12_88/0.22)] transition-[rotate,scale,translate,filter] duration-200 ease-out-expo group-hover/t:-translate-y-1.5 group-hover/t:-rotate-[14deg] group-hover/t:scale-105 group-hover/t:drop-shadow-[0_20px_26px_oklch(0.85_0.12_88/0.35)] group-hover/t:duration-500 motion-reduce:group-hover/t:transform-none" />
            </span>
            <span className="block">
              <span className="block text-[0.8rem] font-semibold text-ink-3">Project</span>
              <span className="block text-[1.6rem] font-semibold tracking-[-0.025em] text-[var(--wave-text)]">Wave</span>
              <span className="mt-1 block text-[0.95rem] leading-snug text-ink-2">Group chat for AI coding agents, while you supervise.</span>
              <span className="mt-5 block border-t border-line pt-3.5 text-[0.85rem] leading-snug">
                <span className="block font-semibold text-ink-3">Now building</span>
                <span className="block font-semibold">End-to-end encryption</span>
              </span>
            </span>
          </Link>
        </li>
        <li className="list-none">
          <Link to="/work/$slug" params={{ slug: 'offlyn' }} onPointerMove={trackPointer} className={cn(bentoTile, projectCard, focusRing)}>
            <Glow color="var(--offlyn)" />
            <span className="flex justify-end"><TileArrow /></span>
            <span className="flex flex-1 items-center justify-center">
              <img src="/media/offlyn/logo.svg" alt="" width={55} height={44} className="w-12 drop-shadow-[0_12px_20px_oklch(0.7_0.18_0/0.3)] transition-[rotate,scale,translate,filter] duration-200 ease-out-expo group-hover/t:-translate-y-1.5 group-hover/t:-rotate-6 group-hover/t:scale-110 group-hover/t:drop-shadow-[0_18px_26px_oklch(0.7_0.18_0/0.45)] group-hover/t:duration-500 motion-reduce:group-hover/t:transform-none" />
            </span>
            <span className="block">
              <span className="block text-[0.8rem] font-semibold text-ink-3">Project</span>
              <span className="block text-[1.3rem] font-semibold tracking-[-0.02em] text-[var(--offlyn-text)]">offlyn.love</span>
              <span className="block text-[0.88rem] leading-snug text-ink-2">Dating through friends of friends</span>
            </span>
          </Link>
        </li>
        <li className="list-none sm:row-span-2"><SocialsTile github={github} /></li>
        <li className="list-none"><PlaygroundTile /></li>
        <li className="list-none">
          <Link to="/blogs/$slug" params={{ slug: 'consistent-randomness' }} onPointerMove={trackPointer} className={cn(bentoTile, 'isolate bg-sheet text-ink', focusRing)}>
            <Glow color="var(--blue)" />
            <span className="flex items-start justify-between gap-4">
              <span className="text-[0.85rem] font-medium tabular-nums text-ink-3">Sep 2024</span>
              <TileArrow />
            </span>
            <span className="block">
              <span className="block text-[1.08rem] font-semibold leading-[1.2] tracking-[-0.015em] transition-colors duration-150 group-hover/t:text-blue-text">
                Randomness is Beautifully Consistent
              </span>
              <span className="mt-1 line-clamp-2 block text-[0.85rem] leading-snug text-ink-3">Coin flips, compression and limited memory.</span>
            </span>
          </Link>
        </li>
        <li className="list-none">
          <a href="/resume.pdf" target="_blank" rel="noreferrer" onPointerMove={trackPointer} className={cn(bentoTile, 'isolate bg-sheet text-ink', focusRing)}>
            <Glow color="var(--blue)" />
            <span className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-2xl bg-sheet-sunk shadow-[inset_0_0_0_1px_var(--line)] transition-transform duration-200 ease-out-expo group-hover/t:-rotate-6 group-hover/t:scale-110 group-hover/t:duration-500 motion-reduce:group-hover/t:transform-none">
                <FileText aria-hidden className="size-[22px] text-blue-text" />
              </span>
              <TileArrow external />
            </span>
            <span className="block">
              <span className="block text-[1.3rem] font-semibold tracking-[-0.02em]">Resume</span>
              <span className="block text-[0.92rem] text-ink-3">PDF</span>
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
        <li className="list-none"><SayHiTile /></li>
      </ul>
      </div>
    </section>
  )
}

export function Portrait() {
  return (
    <div className="relative h-[228px] w-[176px]">
      {/*
        The disc is a backdrop; the cut-out is a real alpha matte that rises
        above it. The mask is open above the disc's lower curve (so head and
        elbows can break out sideways) and follows the circle below it.
      */}
      <div
        className="absolute bottom-0 left-1/2 h-[228px] w-[380px] -translate-x-1/2"
        style={{
          maskImage:
            'linear-gradient(#000, #000), radial-gradient(circle 88px at 50% calc(100% - 88px), #000 calc(100% - 0.5px), transparent 100%)',
          maskSize: '100% calc(100% - 24px), 100% 100%',
          maskPosition: 'top, center',
          maskRepeat: 'no-repeat',
        }}
      >
        <div aria-hidden className="absolute bottom-0 left-1/2 size-[176px] -translate-x-1/2 rounded-full bg-blue" />
        <img
          src="/media/me/portrait-sm.webp"
          srcSet="/media/me/portrait-sm.webp 420w, /media/me/portrait.webp 800w"
          sizes="250px"
          alt="David Sling laughing, hands on hips, in a white shirt"
          width={420}
          height={539}
          fetchPriority="high"
          className="absolute bottom-[-10px] left-1/2 w-[188px] max-w-none -translate-x-1/2 [transform:scale(1.3)_translate(11px,34px)]"
        />
      </div>
      <span
        data-motion="travel"
        className="absolute -right-[74px] top-[34px] inline-block text-[0.8rem] sm:-right-[118px] sm:top-[58px] sm:text-[0.88rem] cursor-default select-none rounded-full bg-ink px-3.5 py-1.5 font-semibold text-sheet sm:px-4 sm:py-2 shadow-[0_10px_20px_-10px_oklch(0.21_0.014_245/0.6)] [--tilt:-7deg] [transform:rotate(var(--tilt))] hover:animate-[sticker-wobble_0.6s_var(--ease-out)]"
      >
        Hi, I’m David
      </span>
    </div>
  )
}
