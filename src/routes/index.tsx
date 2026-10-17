import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/home/hero'
import { Experience, HowIBuild, SiteFooter, Stack, Writing } from '@/components/home/sections'
import { SiteHeader } from '@/components/home/site-header'
import { Work } from '@/components/home/work'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Work />
        <HowIBuild />
        <Experience />
        <Stack />
        <Writing />
      </main>
      <SiteFooter />
    </>
  )
}
