import { verifyAdminLogin } from './authRepository'
import {
  createGuest,
  deleteGuest,
  listGuests,
  updateGuestAdmin,
} from './guestAdmin'
import type { GuestInput } from '../types/admin'
import { createSessionToken, getBearerToken, verifySessionToken } from './session'

type JsonResult = {
  statusCode: number
  headers: Record<string, string>
  body: string
}

function json(statusCode: number, payload: unknown): JsonResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

function requireAdmin(
  authorization: string | undefined | null,
  sessionSecret: string | undefined,
): { adminId: number } | JsonResult {
  if (!sessionSecret) {
    return json(500, { error: 'missing_session_secret' })
  }
  const token = getBearerToken(authorization)
  if (!token) {
    return json(401, { error: 'unauthorized' })
  }
  const session = verifySessionToken(token, sessionSecret)
  if (!session) {
    return json(401, { error: 'invalid_session' })
  }
  return session
}

export async function handleAdminLoginPost(
  bodyRaw: string,
  databaseUrl: string | undefined,
  sessionSecret: string | undefined,
): Promise<JsonResult> {
  if (!databaseUrl) return json(500, { error: 'missing_database_url' })
  if (!sessionSecret) return json(500, { error: 'missing_session_secret' })

  let body: { username?: unknown; password?: unknown }
  try {
    body = JSON.parse(bodyRaw || '{}') as typeof body
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const username = typeof body.username === 'string' ? body.username : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!username.trim() || !password) {
    return json(400, { error: 'invalid_credentials' })
  }

  try {
    const admin = await verifyAdminLogin(databaseUrl, username, password)
    if (!admin) {
      return json(401, { error: 'invalid_credentials' })
    }
    const token = createSessionToken(admin.id, sessionSecret)
    return json(200, {
      token,
      admin: { id: admin.id, username: admin.username },
    })
  } catch {
    return json(500, { error: 'server_error' })
  }
}

export async function handleAdminGuests(
  method: string,
  bodyRaw: string,
  query: { id?: string },
  authorization: string | undefined | null,
  databaseUrl: string | undefined,
  sessionSecret: string | undefined,
): Promise<JsonResult> {
  const auth = requireAdmin(authorization, sessionSecret)
  if ('statusCode' in auth) return auth

  if (!databaseUrl) return json(500, { error: 'missing_database_url' })

  try {
    if (method === 'GET') {
      const guests = await listGuests(databaseUrl)
      return json(200, { guests })
    }

    if (method === 'POST') {
      let body: GuestInput
      try {
        body = JSON.parse(bodyRaw || '{}') as GuestInput
      } catch {
        return json(400, { error: 'invalid_json' })
      }
      if (!body.name?.trim() || !body.guest_type?.trim()) {
        return json(400, { error: 'invalid_guest' })
      }
      const guest = await createGuest(databaseUrl, body)
      return json(201, { guest })
    }

    const id = Number(query.id)
    if (!Number.isFinite(id)) {
      return json(400, { error: 'invalid_id' })
    }

    if (method === 'PUT' || method === 'PATCH') {
      let body: Partial<GuestInput>
      try {
        body = JSON.parse(bodyRaw || '{}') as Partial<GuestInput>
      } catch {
        return json(400, { error: 'invalid_json' })
      }
      const guest = await updateGuestAdmin(databaseUrl, id, body)
      if (!guest) return json(404, { error: 'not_found' })
      return json(200, { guest })
    }

    if (method === 'DELETE') {
      const ok = await deleteGuest(databaseUrl, id)
      if (!ok) return json(404, { error: 'not_found' })
      return json(200, { ok: true })
    }

    return json(405, { error: 'method_not_allowed' })
  } catch {
    return json(500, { error: 'server_error' })
  }
}

export async function handleAdminSessionGet(
  authorization: string | undefined | null,
  sessionSecret: string | undefined,
): Promise<JsonResult> {
  const auth = requireAdmin(authorization, sessionSecret)
  if ('statusCode' in auth) return auth
  return json(200, { ok: true, adminId: auth.adminId })
}
