import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { guestTable } from '../db/schema'
import type { GuestPublic } from '../types/guest'

export async function lookupGuestByCode(
  databaseUrl: string,
  code: string,
): Promise<GuestPublic | null> {
  const db = drizzle(databaseUrl)
  const normalized = code.trim().toUpperCase()
  const rows = await db
    .select({
      id: guestTable.id,
      name: guestTable.name,
      guest_type: guestTable.guest_type,
      is_attending: guestTable.is_attending,
      message: guestTable.message,
    })
    .from(guestTable)
    .where(eq(guestTable.invitation_code, normalized))
    .limit(1)

  return rows[0] ?? null
}
