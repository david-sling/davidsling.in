import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/home/site-header'
import { formatDate, posts } from '@/lib/content'

// Keeps the old /blogs/<slug> URLs alive; the MDX posts move here next.
export const Route = createFileRoute('/blogs/$slug')({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug)
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.title} — David Sling` }] : [],
  }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[760px] px-4 pb-24 pt-16 sm:px-6">
        <time dateTime={post.date} className="tabular text-ink-3">
          {formatDate(post.date)}
        </time>
        <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] font-semibold tracking-[-0.03em]">{post.title}</h1>
        <p className="mt-6 text-[1.2rem] text-ink-2">{post.summary}</p>
        <p className="mt-10 rounded-[24px] bg-sheet p-6 text-ink-2 shadow-[var(--shadow-tile)]">
          This post is moving to the new site. The full text lands here shortly.
        </p>
        <Link
          to="/"
          hash="writing"
          className="group/back mt-8 inline-flex items-center gap-2 rounded-full py-2 font-semibold no-underline"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform duration-300 ease-out-expo group-hover/back:-translate-x-1"
          />
          All writing
        </Link>
      </main>
    </>
  )
}
