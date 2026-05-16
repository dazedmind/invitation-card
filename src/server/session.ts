import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function createSessionToken(adminId: number, secret: string): string {
  const exp = Date.now() + SESSION_TTL_MS
  const payload = `${adminId}.${exp}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifySessionToken(
  token: string,
  secret: string,
): { adminId: number } | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [idRaw, expRaw, sig] = parts
  const adminId = Number(idRaw)
  const exp = Number(expRaw)
  if (!Number.isFinite(adminId) || !Number.isFinite(exp)) return null
  if (Date.now() > exp) return null

  const payload = `${adminId}.${exp}`
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }

  return { adminId }
}

export function getBearerToken(
  authorization: string | undefined | null,
): string | null {
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice(7).trim() || null
}
