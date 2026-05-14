import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { guestTable } from '../db/schema'

export async function updateGuest(
  databaseUrl: string,
  id: number,
  fields: { is_attending: boolean; message?: string },
): Promise<void> {
  const db = drizzle(databaseUrl)
  const patch: { is_attending: boolean; message?: string } = {
    is_attending: fields.is_attending,
  }
  if (fields.message !== undefined) patch.message = fields.message
  await db.update(guestTable).set(patch).where(eq(guestTable.id, id))
}
