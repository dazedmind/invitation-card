import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

import { lookupGuestByCode } from './src/server/lookupGuest'
import { updateGuest } from './src/server/updateGuest'

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

function guestApiMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url ?? ''
    if (!rawUrl.startsWith('/api/guest')) {
      next()
      return
    }

    void (async () => {
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'missing_database_url' }))
        return
      }

      const u = new URL(rawUrl, 'http://vite.local')

      try {
        if (req.method === 'GET' && u.pathname === '/api/guest') {
          const code = u.searchParams.get('code') ?? ''
          if (code.trim().length !== 6) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'invalid_code' }))
            return
          }

          const guest = await lookupGuestByCode(databaseUrl, code)
          res.setHeader('Content-Type', 'application/json')
          if (!guest) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'not_found' }))
            return
          }
          res.statusCode = 200
          res.end(JSON.stringify({ guest }))
          return
        }

        if (req.method === 'POST' && u.pathname === '/api/guest/rsvp') {
          let body: { id?: unknown; is_attending?: unknown; message?: unknown }
          try {
            body = JSON.parse((await readBody(req)) || '{}') as typeof body
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'invalid_json' }))
            return
          }

          const id = typeof body.id === 'number' ? body.id : Number(body.id)
          if (!Number.isFinite(id)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'invalid_id' }))
            return
          }

          const isAttending =
            typeof body.is_attending === 'boolean' ? body.is_attending : true
          const message =
            typeof body.message === 'string' ? body.message : undefined

          await updateGuest(databaseUrl, id, {
            is_attending: isAttending,
            message,
          })

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
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
