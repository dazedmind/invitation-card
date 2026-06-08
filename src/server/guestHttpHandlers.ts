import { lookupGuestByCode } from './lookupGuest'
import { updateGuest } from './updateGuest'

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

export async function handleGuestLookupGet(
  code: string,
  databaseUrl: string | undefined,
): Promise<JsonResult> {
  if (!databaseUrl) {
    return json(500, { error: 'missing_database_url' })
  }
  if (code.trim().length !== 6) {
    return json(400, { error: 'invalid_code' })
  }
  try {
    const guests = await lookupGuestByCode(databaseUrl, code)
    if (guests.length === 0) {
      return json(404, { error: 'not_found' })
    }
    return json(200, { guests })
  } catch {
    return json(500, { error: 'server_error' })
  }
}

export async function handleGuestRsvpPost(
  bodyRaw: string,
  databaseUrl: string | undefined,
): Promise<JsonResult> {
  if (!databaseUrl) {
    return json(500, { error: 'missing_database_url' })
  }

  let body: { id?: unknown; is_attending?: unknown; message?: unknown }
  try {
    body = JSON.parse(bodyRaw || '{}') as typeof body
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const id = typeof body.id === 'number' ? body.id : Number(body.id)
  if (!Number.isFinite(id)) {
    return json(400, { error: 'invalid_id' })
  }

  const isAttending =
    typeof body.is_attending === 'boolean' ? body.is_attending : true
  const message =
    typeof body.message === 'string' ? body.message : undefined

  try {
    await updateGuest(databaseUrl, id, {
      is_attending: isAttending,
      message,
    })
  } catch {
    return json(500, { error: 'server_error' })
  }

  return json(200, { ok: true })
}
