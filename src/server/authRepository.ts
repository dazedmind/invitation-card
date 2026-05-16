import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { authTable } from '../db/schema'
import { verifyPassword } from './password'

export async function verifyAdminLogin(
  databaseUrl: string,
  username: string,
  password: string,
): Promise<{ id: number; username: string } | null> {
  const db = drizzle(databaseUrl)
  const rows = await db
    .select({
      id: authTable.id,
      username: authTable.username,
      password_hash: authTable.password_hash,
    })
    .from(authTable)
    .where(eq(authTable.username, username.trim()))
    .limit(1)

  const admin = rows[0]
  if (!admin) return null
  const ok = await verifyPassword(password, admin.password_hash)
  if (!ok) return null
  return { id: admin.id, username: admin.username }
}
