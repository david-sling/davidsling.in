import { createFileRoute } from '@tanstack/react-router'

export type NowPlaying =
  | { configured: false }
  | {
      configured: true
      playing: boolean
      track: { title: string; artist: string; album: string; art: string | null; url: string } | null
    }

/**
 * David's Spotify: what is playing now, or the last thing played.
 * Credentials live only in server env (SPOTIFY_CLIENT_ID,
 * SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN; see
 * scripts/spotify-auth.mjs). Without them the card stays hidden.
 */
export const Route = createFileRoute('/api/now-playing')({
  server: {
    handlers: {
      GET: async () => {
        const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env
        if (!id || !secret || !refresh) return json({ configured: false }, 3600)

        try {
          const token = await accessToken(id, secret, refresh)
          const auth = { Authorization: `Bearer ${token}` }

          const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: auth })
          if (now.status === 200) {
            const data = (await now.json()) as { is_playing: boolean; currently_playing_type: string; item: SpotifyTrack | null }
            if (data.item && data.currently_playing_type === 'track') {
              return json({ configured: true, playing: data.is_playing, track: shape(data.item) }, 30)
            }
          }

          const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: auth })
          if (!recent.ok) throw new Error(`recently-played ${recent.status}`)
          const data = (await recent.json()) as { items: { track: SpotifyTrack }[] }
          const last = data.items[0]?.track
          return json({ configured: true, playing: false, track: last ? shape(last) : null }, 60)
        } catch {
          // Never leak upstream errors or tokens; the card renders its quiet state.
          return json({ configured: true, playing: false, track: null }, 60)
        }
      },
    },
  },
})

type SpotifyTrack = {
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string; width: number }[] }
  external_urls: { spotify: string }
}

function shape(t: SpotifyTrack) {
  const art = [...t.album.images].sort((a, b) => a.width - b.width).find((i) => i.width >= 128) ?? t.album.images[0]
  return {
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    album: t.album.name,
    art: art?.url ?? null,
    url: t.external_urls.spotify,
  }
}

async function accessToken(id: string, secret: string, refresh: string) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  })
  if (!res.ok) throw new Error(`token ${res.status}`)
  return ((await res.json()) as { access_token: string }).access_token
}

function json(body: NowPlaying, maxAge: number) {
  return Response.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 4}` },
  })
}
