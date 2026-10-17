import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { SiteHeader } from '@/components/home/site-header'
import { projects } from '@/lib/content'

export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug)
    if (!project) throw notFound()
    return project
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.name} — David Sling` }] : [],
  }),
  component: ProjectPage,
})

function ProjectPage() {
  const project = Route.useLoaderData()
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1240px] px-4 pb-24 pt-4 sm:px-6">
        <div
          className="rounded-[40px] px-6 py-16 sm:px-14 sm:py-24"
          style={{ background: `var(--${project.slug})`, color: `var(--${project.slug}-deep)` }}
        >
          <p className="tabular font-semibold">{project.year}</p>
          <h1 className="mt-3 text-[clamp(3rem,8vw,6rem)] font-semibold tracking-[-0.04em]">{project.name}</h1>
          <p className="mt-6 max-w-[48ch] text-[1.25rem] font-medium">{project.summary}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {project.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group/soc inline-flex h-12 items-center gap-2 rounded-full bg-[oklch(1_0_0/0.9)] px-6 font-semibold no-underline transition-transform duration-150 active:scale-[0.97]"
              >
                {l.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover/soc:-translate-y-0.5 group-hover/soc:translate-x-0.5"
                />
              </a>
            ))}
          </div>
        </div>
        <p className="mt-10 max-w-[60ch] text-ink-2">
          The full case study for {project.name} is being written. Until then, the links above go straight to the
          real thing.
        </p>
        <Link
          to="/"
          hash="work"
          className="group/back mt-6 inline-flex items-center gap-2 rounded-full py-2 font-semibold no-underline"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform duration-300 ease-out-expo group-hover/back:-translate-x-1"
          />
          All work
        </Link>
      </main>
    </>
  )
}
