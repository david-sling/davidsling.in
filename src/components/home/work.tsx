import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { SlideArrow } from '@/components/button'
import { Pendulum } from '@/components/pendulum'
import { OfflynDino } from '@/components/offlyn-dino'
import { CoachedPreview } from '@/components/work/ai-protect'
import { TiltCard } from '@/components/tilt-card'
import { projects, type Project, type ProjectSlug } from '@/lib/content'
import { cn } from '@/lib/utils'

const theme: Record<ProjectSlug, { field: string; text: string }> = {
  wave: { field: 'bg-[var(--wave)]', text: 'group-hover/link:text-[var(--wave-text)]' },
  equanim: { field: 'bg-[var(--equanim)]', text: 'group-hover/link:text-[var(--equanim-text)]' },
  offlyn: { field: 'bg-[var(--offlyn)]', text: 'group-hover/link:text-[var(--offlyn-text)]' },
  'ai-protect': { field: 'bg-[var(--ai-protect)]', text: 'group-hover/link:text-[var(--ai-protect-text)]' },
}

export function Work() {
  const [lead, ...rest] = projects
  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-[1240px] px-4 pt-16 sm:px-6 sm:pt-20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="work-title" className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold tracking-[-0.03em]">
          Selected work
          <sup className="tabular ml-1.5 align-super text-[0.4em] font-medium tracking-normal text-ink-3">({String(projects.length).padStart(2, '0')})</sup>
        </h2>
        <p className="max-w-[40ch] text-ink-2">
          Four products from the last year, each shipped end to end with agents in the loop.
        </p>
      </div>

      <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2">
        <ProjectCard project={lead} className="md:col-span-2" wide />
        {rest.map((p, i) => {
          // An odd one out at the end spans the row, so the grid never leaves a hole.
          const wide = i === rest.length - 1 && rest.length % 2 === 1
          return <ProjectCard key={p.slug} project={p} className={wide ? 'md:col-span-2' : undefined} wide={wide} />
        })}
      </div>
    </section>
  )
}

function ProjectCard({ project, className, wide }: { project: Project; className?: string; wide?: boolean }) {
  const t = theme[project.slug]
  const video = useRef<HTMLVideoElement>(null)

  return (
    <article className={cn('relative', className)}>
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        className="group/link block rounded-[30px] no-underline"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') playIfAllowed(video.current)
        }}
        onPointerLeave={() => video.current?.pause()}
        onFocus={() => playIfAllowed(video.current)}
        onBlur={() => video.current?.pause()}
      >
        <TiltCard
          tiltLimit={0}
          scale={1}
          className={cn('rounded-[28px]', t.field, wide ? 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-[5/2] xl:aspect-[3/1]' : 'aspect-[4/3]')}
        >
          <Media slug={project.slug} video={video} wide={wide} />
          {project.builtAt && (
            <span className="absolute left-4 top-4 rounded-full bg-[oklch(1_0_0/0.88)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-[oklch(0.25_0.02_250)] sm:left-5 sm:top-5">
              Built at {project.builtAt}
            </span>
          )}
        </TiltCard>

        <div className="mt-5 flex items-baseline justify-between gap-4 px-1">
          <h3
            className={cn(
              'flex items-center gap-2.5 text-[1.6rem] font-semibold tracking-[-0.02em] transition-colors duration-200',
              t.text,
            )}
          >
            {project.logo && (
              <img
                src={project.logo}
                alt=""
                width={32}
                height={32}
                className="size-8 origin-[70%_85%] transition-transform duration-300 ease-out-expo group-hover/link:-rotate-12 motion-reduce:transition-none"
              />
            )}
            {project.name}
          </h3>
          <span className="tabular text-[0.95rem] font-medium text-ink-3">{project.year}</span>
        </div>
        <p className={cn('mt-2 px-1 text-ink-2', wide ? 'max-w-[62ch]' : 'max-w-[52ch]')}>{project.summary}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
          <ul className="m-0 flex flex-wrap gap-1.5 p-0" aria-label="Built with">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="list-none rounded-full bg-sheet px-3 py-1 text-[0.8rem] font-medium text-ink-2 shadow-[0_0_0_1px_var(--line)]"
              >
                {tag}
              </li>
            ))}
          </ul>
          <span className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-ink">
            Case study
            <SlideArrow />
          </span>
        </div>
      </Link>
      {project.slug === 'equanim' && (
        // A sibling of the card link, laid over its media, so it can be its own link.
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/3]">
          <Link
            to="/work/$slug"
            params={{ slug: 'equanim' }}
            hash="playground"
            data-motion="travel"
            className="group/btn pointer-events-auto absolute bottom-4 left-4 inline-flex min-h-11 select-none items-center gap-2 rounded-full bg-[oklch(1_0_0/0.85)] pl-4 pr-3.5 text-[0.85rem] font-semibold text-[var(--equanim-deep)] no-underline shadow-[0_6px_16px_-8px_oklch(0.3_0.08_220/0.5)] origin-bottom transition-[transform,background-color] duration-150 ease-out-quart hover:bg-white active:scale-x-[1.02] active:scale-y-[0.92] active:duration-75 sm:bottom-5 sm:left-5"
          >
            Try the playground
            <SlideArrow />
          </Link>
        </div>
      )}
    </article>
  )
}

function playIfAllowed(v: HTMLVideoElement | null) {
  if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  v.play().catch(() => {})
}

function Media({
  slug,
  video,
  wide,
}: {
  slug: ProjectSlug
  video: React.RefObject<HTMLVideoElement | null>
  wide?: boolean
}) {
  if (slug === 'wave') return <WaveMedia video={video} wide={wide} />
  if (slug === 'ai-protect') {
    return (
      <div className="absolute inset-0 grid place-items-center px-2 pb-2 pt-12 sm:p-10">
        <div className="flex w-full justify-center transition-transform duration-500 ease-out-expo group-hover/link:-translate-y-1.5 group-hover/link:rotate-[-1deg]">
          <div className="flex w-full scale-[0.86] justify-center sm:scale-100 md:scale-[1.1] lg:scale-[1.08]">
            <CoachedPreview />
          </div>
        </div>
      </div>
    )
  }
  if (slug === 'equanim') {
    return (
      <div className="absolute inset-0">
        <Pendulum className="absolute inset-0 size-full" />
      </div>
    )
  }
  return (
    <div className="absolute inset-x-0 top-0 bottom-[10%] transition-transform duration-500 ease-out-expo group-hover/link:-translate-y-1.5 group-hover/link:scale-[1.03]">
      <OfflynDino size={0.6} />
    </div>
  )
}

function WaveMedia({ video, wide }: { video: React.RefObject<HTMLVideoElement | null>; wide?: boolean }) {
  // Touch devices have no hover: play while the card is on screen instead.
  useEffect(() => {
    const v = video.current
    if (!v || window.matchMedia('(hover: hover)').matches) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? playIfAllowed(v) : v.pause()), {
      threshold: 0.5,
    })
    io.observe(v)
    return () => io.disconnect()
  }, [video])

  return (
    <div
      data-motion="travel"
      className={cn(
        'absolute overflow-hidden rounded-[16px] bg-[#f3f3f1] shadow-[0_30px_50px_-20px_oklch(0.3_0.08_80/0.55),0_0_0_1px_oklch(0.3_0.08_80/0.15)] transition-transform duration-500 ease-out-expo',
        wide
          ? 'left-[6%] right-[6%] top-[12%] sm:left-[18%] sm:right-[-4%] sm:top-[14%] lg:left-[20%] lg:right-[20%] lg:top-[8%] xl:left-[25%] xl:right-[25%]'
          : 'left-[8%] right-[-6%] top-[14%]',
        'group-hover/link:-translate-y-2',
      )}
    >
      <video
        ref={video}
        src="/media/wave/how-it-works.mp4"
        poster="/media/wave/how-it-works-poster.webp"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="How Wave works: a Mac agent and a Windows agent join a channel from a copied prompt, report their build results, and David steers the fix"
        className="block aspect-video w-full"
      />
    </div>
  )
}
