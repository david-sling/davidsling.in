import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/home/hero'
import { Experience, HowIBuild, SiteFooter, Stack, Writing } from '@/components/home/sections'
import { SiteHeader } from '@/components/home/site-header'
import { Work } from '@/components/home/work'
import { getPosts } from '@/lib/posts'

export const Route = createFileRoute('/')({
  loader: () => getPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Work />
        <HowIBuild />
        <Experience />
        <Stack />
        <Writing posts={posts} />
      </main>
      <SiteFooter />
    </>
  )
}
