#!/usr/bin/env node
// One-time Spotify authorisation for the "now playing" card.
//
// 1. Create an app at https://developer.spotify.com/dashboard and add the
//    redirect URI http://127.0.0.1:8888/callback
// 2. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
// 3. Run `node scripts/spotify-auth.mjs`, open the printed URL, approve.
//
// The refresh token is written to .env.local (gitignored) and never printed.
// Copy the three SPOTIFY_* values into the Vercel project's environment.

import { createServer } from 'node:http'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const ENV_FILE = '.env.local'
const REDIRECT = 'http://127.0.0.1:8888/callback'
const SCOPES = 'user-read-currently-playing user-read-recently-played'

const env = Object.fromEntries(
  (existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)
const id = process.env.SPOTIFY_CLIENT_ID ?? env.SPOTIFY_CLIENT_ID
const secret = process.env.SPOTIFY_CLIENT_SECRET ?? env.SPOTIFY_CLIENT_SECRET
if (!id || !secret) {
  console.error(`Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in ${ENV_FILE}.`)
  process.exit(1)
}

const state = crypto.randomUUID()
const authorize = new URL('https://accounts.spotify.com/authorize')
authorize.search = new URLSearchParams({ client_id: id, response_type: 'code', redirect_uri: REDIRECT, scope: SCOPES, state }).toString()

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', REDIRECT)
  if (url.pathname !== '/callback') return res.writeHead(404).end()
  if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) {
    res.writeHead(400).end('Authorisation failed or was cancelled. Run the script again.')
    return finish(1)
  }

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: REDIRECT }),
  })
  if (!tokenRes.ok) {
    res.writeHead(500).end('Spotify rejected the code exchange. Check the client secret and redirect URI.')
    return finish(1)
  }
  const { refresh_token } = await tokenRes.json()

  const lines = (existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '').split('\n').filter((l) => !l.startsWith('SPOTIFY_REFRESH_TOKEN='))
  lines.push(`SPOTIFY_REFRESH_TOKEN=${refresh_token}`)
  writeFileSync(ENV_FILE, lines.filter(Boolean).join('\n') + '\n', { mode: 0o600 })

  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. You can close this tab.')
  console.log(`Saved SPOTIFY_REFRESH_TOKEN to ${ENV_FILE}. Add all three SPOTIFY_* values to Vercel.`)
  finish(0)
})

function finish(code) {
  server.close()
  process.exitCode = code
}

server.listen(8888, '127.0.0.1', () => {
  console.log('Open this URL and approve access:\n')
  console.log(authorize.toString())
})
