import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export async function verifyPassword(
  password: string,
  stored: string | null,
): Promise<boolean> {
  if (!stored) return false  // ← Add this line
  
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  
  try {  // ← Add try-catch
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    const candidate = (await scryptAsync(password, salt, 64)) as Buffer
    if (expected.length !== candidate.length) return false
    return timingSafeEqual(expected, candidate)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}