import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

import {
  handleAdminGuests,
  handleAdminLoginPost,
  handleAdminSessionGet,
} from './src/server/adminHttpHandlers'
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

function sendJson(
  res: ServerResponse,
  result: { statusCode: number; headers: Record<string, string>; body: string },
) {
  res.statusCode = result.statusCode
  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v)
  }
  res.end(result.body)
}

function apiMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url ?? ''
    if (!rawUrl.startsWith('/api/')) {
      next()
      return
    }

    void (async () => {
      const databaseUrl = process.env.DATABASE_URL
      const sessionSecret = process.env.SESSION_SECRET
      const u = new URL(rawUrl, 'http://vite.local')
      const auth = req.headers.authorization ?? null

      try {
        if (req.method === 'GET' && u.pathname === '/api/guest') {
          const code = u.searchParams.get('code') ?? ''
          sendJson(res, await handleGuestLookupGet(code, databaseUrl))
          return
        }

        if (req.method === 'POST' && u.pathname === '/api/guest/rsvp') {
          const raw = await readBody(req)
          sendJson(res, await handleGuestRsvpPost(raw, databaseUrl))
          return
        }

        if (req.method === 'POST' && u.pathname === '/api/admin/login') {
          const raw = await readBody(req)
          sendJson(
            res,
            await handleAdminLoginPost(raw, databaseUrl, sessionSecret),
          )
          return
        }

        if (u.pathname === '/api/admin/session' && req.method === 'GET') {
          sendJson(res, await handleAdminSessionGet(auth, sessionSecret))
          return
        }

        if (u.pathname === '/api/admin/guests') {
          const raw =
            req.method === 'GET' || req.method === 'DELETE'
              ? ''
              : await readBody(req)
          sendJson(
            res,
            await handleAdminGuests(
              req.method ?? 'GET',
              raw,
              { id: u.searchParams.get('id') ?? undefined },
              auth,
              databaseUrl,
              sessionSecret,
            ),
          )
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

export function apiPlugin(): Plugin {
  const middleware = apiMiddleware()
  return {
    name: 'api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
