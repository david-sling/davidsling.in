/**
 * Shared by every route that calls GitHub (/api/github, /api/commits).
 *
 * Answers are cached on Vercel's CDN, so GitHub is asked at most once per
 * window per region however many people load the site. The window is one
 * minute when a GITHUB_TOKEN is set (5,000 calls an hour) and one hour
 * without it: unauthenticated GitHub allows 60 calls an hour, which a
 * one-minute window would use up. The token never leaves the server.
 */
export function githubTtl() {
  return process.env.GITHUB_TOKEN ? 60 : 3600
}

export function githubHeaders() {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'davidsling.in',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Cache-Control for a GitHub-backed response. A complete answer is fresh for
 * one window and may be served stale for a day while the CDN refetches, so
 * no visitor waits on GitHub. An incomplete one is retried after a minute.
 */
export function githubCache(complete = true) {
  return complete
    ? `public, s-maxage=${githubTtl()}, stale-while-revalidate=86400`
    : 'public, s-maxage=60'
}
