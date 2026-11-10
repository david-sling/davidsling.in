import { createFileRoute } from '@tanstack/react-router'

export type NpmRelease = { name: string; version: string } | null

/** Packages this route will look up. Anything else is refused, so it can't be used as an open proxy. */
const PACKAGES = new Set(['cmd-facts'])

/**
 * The latest published version of one of David's npm packages, from the
 * public registry (no token needed). Cached at the edge for an hour.
 */
export const Route = createFileRoute('/api/npm')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const name = new URL(request.url).searchParams.get('package') ?? ''
        if (!PACKAGES.has(name)) return Response.json(null, { status: 404 })
        const body: NpmRelease = await fetch(`https://registry.npmjs.org/${name}/latest`, {
          headers: { Accept: 'application/json', 'User-Agent': 'davidsling.in' },
        })
          .then((r) => (r.ok ? (r.json() as Promise<{ version?: unknown }>) : Promise.reject(r.status)))
          .then((d) => (typeof d.version === 'string' ? { name, version: d.version } : null))
          .catch(() => null)
        return Response.json(body, {
          headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
        })
      },
    },
  },
})
