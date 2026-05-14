import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

import {
  handleGuestLookupGet,
  handleGuestRsvpPost,
} from './src/server/guestHttpHandlers'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, result: Awaited<ReturnType<typeof handleGuestLookupGet>>) {
  res.statusCode = result.statusCode
  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v)
  }
  res.end(result.body)
}

function guestApiMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url ?? ''
    if (!rawUrl.startsWith('/api/guest')) {
      next()
      return
    }

    void (async () => {
      const databaseUrl = process.env.DATABASE_URL
      const u = new URL(rawUrl, 'http://vite.local')

      try {
        if (req.method === 'GET' && u.pathname === '/api/guest') {
          const code = u.searchParams.get('code') ?? ''
          const result = await handleGuestLookupGet(code, databaseUrl)
          sendJson(res, result)
          return
        }

        if (req.method === 'POST' && u.pathname === '/api/guest/rsvp') {
          const raw = await readBody(req)
          const result = await handleGuestRsvpPost(raw, databaseUrl)
          sendJson(res, result)
          return
        }

        next()
      } catch {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'server_error' }))
      }
    })()
  }
}

export function guestApiPlugin(): Plugin {
  const middleware = guestApiMiddleware()
  return {
    name: 'guest-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
