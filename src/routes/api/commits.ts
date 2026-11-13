import { createFileRoute } from '@tanstack/react-router'
import { COMMIT_REPOS, type CommitCounts, type CommitRepo } from '@/lib/commits'
import { githubCache, githubHeaders, githubTtl } from '@/lib/github.server'

const OWNER = 'david-sling'

/**
 * How many commits each public repo has on its default branch, and how many
 * of them carry a Claude co-author line. Both numbers come from GitHub's
 * public API, cached on the CDN as lib/github.server describes.
 */
export const Route = createFileRoute('/api/commits')({
  server: {
    handlers: {
      GET: async () => {
        const entries = await Promise.all(COMMIT_REPOS.map(async (repo) => [repo, await cached(repo)] as const))
        const body = Object.fromEntries(entries) as CommitCounts
        // A miss (usually GitHub's search rate limit) is kept for a minute, not an hour, so it heals quickly.
        const complete = entries.every(([, c]) => c)
        return Response.json(body, {
          headers: { 'Cache-Control': githubCache(complete) },
        })
      },
    },
  },
})

/**
 * The last good answer per repo, kept in this server instance for one cache
 * window. It covers dev, which has no CDN in front of it, and gives a
 * rate-limited request something older to return.
 */
const memory = new Map<CommitRepo, { at: number; value: { total: number; claude: number } }>()

async function cached(repo: CommitRepo) {
  const hit = memory.get(repo)
  if (hit && Date.now() - hit.at < githubTtl() * 1000) return hit.value
  const value = await count(repo).catch((e) => (console.error('commits', repo, String(e)), null))
  if (value) memory.set(repo, { at: Date.now(), value })
  // Rate-limited or down: an older answer beats none.
  return value ?? hit?.value ?? null
}

async function count(repo: CommitRepo) {
  const [total, claude] = await Promise.all([totalCommits(repo), claudeCommits(repo)])
  // A count that can't be true means one of the two calls misread; show the fallback instead.
  if (!total || claude > total) return null
  return { total, claude }
}

/** One commit per page, so the number of the last page is the number of commits. */
async function totalCommits(repo: CommitRepo) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/commits?per_page=1`, { headers: githubHeaders() })
  if (!res.ok) throw new Error(`commits ${res.status}`)
  const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/)?.[1]
  return last ? Number(last) : ((await res.json()) as unknown[]).length
}

async function claudeCommits(repo: CommitRepo) {
  const q = encodeURIComponent(`repo:${OWNER}/${repo} "Co-Authored-By: Claude"`)
  const res = await fetch(`https://api.github.com/search/commits?q=${q}&per_page=1`, { headers: githubHeaders() })
  if (!res.ok) throw new Error(`search ${res.status}`)
  const data = (await res.json()) as { total_count?: unknown }
  if (typeof data.total_count !== 'number') throw new Error('search shape')
  return data.total_count
}
