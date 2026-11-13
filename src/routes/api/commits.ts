import { createFileRoute } from '@tanstack/react-router'
import { COMMIT_REPOS, type CommitCounts, type CommitRepo } from '@/lib/commits'

const OWNER = 'david-sling'

/**
 * How many commits each public repo has on its default branch, and how many
 * of them carry a Claude co-author line. Both numbers come from GitHub's
 * public API; a GITHUB_TOKEN, if set, only raises the rate limit and never
 * leaves the server. Cached at the edge for an hour.
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
          headers: {
            'Cache-Control': complete
              ? 'public, s-maxage=3600, stale-while-revalidate=86400'
              : 'public, s-maxage=60',
          },
        })
      },
    },
  },
})

/**
 * The last good answer per repo, kept in this server instance for an hour.
 * Unauthenticated GitHub allows 60 calls an hour and 10 searches a minute,
 * so without this a few page loads in dev (no edge cache) use them up.
 */
const HOUR = 60 * 60 * 1000
const memory = new Map<CommitRepo, { at: number; value: { total: number; claude: number } }>()

async function cached(repo: CommitRepo) {
  const hit = memory.get(repo)
  if (hit && Date.now() - hit.at < HOUR) return hit.value
  const value = await count(repo).catch((e) => (console.error('commits', repo, String(e)), null))
  if (value) memory.set(repo, { at: Date.now(), value })
  // Rate-limited or down: an older answer beats none.
  return value ?? hit?.value ?? null
}

function headers() {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'davidsling.in',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function count(repo: CommitRepo) {
  const [total, claude] = await Promise.all([totalCommits(repo), claudeCommits(repo)])
  // A count that can't be true means one of the two calls misread; show the fallback instead.
  if (!total || claude > total) return null
  return { total, claude }
}

/** One commit per page, so the number of the last page is the number of commits. */
async function totalCommits(repo: CommitRepo) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/commits?per_page=1`, { headers: headers() })
  if (!res.ok) throw new Error(`commits ${res.status}`)
  const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/)?.[1]
  return last ? Number(last) : ((await res.json()) as unknown[]).length
}

async function claudeCommits(repo: CommitRepo) {
  const q = encodeURIComponent(`repo:${OWNER}/${repo} "Co-Authored-By: Claude"`)
  const res = await fetch(`https://api.github.com/search/commits?q=${q}&per_page=1`, { headers: headers() })
  if (!res.ok) throw new Error(`search ${res.status}`)
  const data = (await res.json()) as { total_count?: unknown }
  if (typeof data.total_count !== 'number') throw new Error('search shape')
  return data.total_count
}
