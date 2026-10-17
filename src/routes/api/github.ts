import { createFileRoute } from '@tanstack/react-router'

const USER = 'david-sling'

export type ContributionDay = { date: string; level: number; count: number }
export type GithubPulse = {
  total: number | null
  days: ContributionDay[]
  commit: { repo: string; message: string; sha: string; url: string; date: string } | null
}

/**
 * Public GitHub activity: the contribution calendar (from the public
 * contributions page, no token needed) and the latest non-merge public
 * commit (commit search API). Cached at the edge for an hour.
 */
export const Route = createFileRoute('/api/github')({
  server: {
    handlers: {
      GET: async () => {
        const [calendar, commit] = await Promise.allSettled([fetchCalendar(), fetchLatestCommit()])
        const body: GithubPulse = {
          total: calendar.status === 'fulfilled' ? calendar.value.total : null,
          days: calendar.status === 'fulfilled' ? calendar.value.days : [],
          commit: commit.status === 'fulfilled' ? commit.value : null,
        }
        return Response.json(body, {
          headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
        })
      },
    },
  },
})

async function fetchCalendar() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': 'davidsling.in' },
  })
  if (!res.ok) throw new Error(`contributions ${res.status}`)
  const html = await res.text()

  // Each day cell has an id; its tooltip carries the count ("3 contributions on …").
  const counts = new Map<string, number>()
  for (const m of html.matchAll(/for="(contribution-day-component-[\d-]+)"[^>]*>\s*(No|\d+) contributions? on/g)) {
    counts.set(m[1], m[2] === 'No' ? 0 : Number(m[2]))
  }
  const days: ContributionDay[] = []
  for (const m of html.matchAll(/data-date="([\d-]+)"\s+id="(contribution-day-component-[\d-]+)"\s+data-level="(\d)"/g)) {
    days.push({ date: m[1], level: Number(m[3]), count: counts.get(m[2]) ?? 0 })
  }
  days.sort((a, b) => a.date.localeCompare(b.date))

  const flat = html.replace(/\s+/g, ' ')
  const total = flat.match(/([\d,]+) contributions in the last year/)?.[1]
  return { days, total: total ? Number(total.replace(/,/g, '')) : days.reduce((n, d) => n + d.count, 0) }
}

async function fetchLatestCommit() {
  const res = await fetch(
    `https://api.github.com/search/commits?q=author:${USER}+is:public&sort=author-date&order=desc&per_page=10`,
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'davidsling.in' } },
  )
  if (!res.ok) throw new Error(`search ${res.status}`)
  const data = (await res.json()) as {
    items: { sha: string; html_url: string; repository: { full_name: string; private: boolean }; commit: { message: string; author: { date: string } } }[]
  }
  const item = data.items.find((i) => !i.repository.private && !/^Merge (pull request|branch)/.test(i.commit.message))
  if (!item) return null
  return {
    repo: item.repository.full_name,
    message: item.commit.message.split('\n')[0],
    sha: item.sha.slice(0, 7),
    url: item.html_url,
    date: item.commit.author.date,
  }
}
