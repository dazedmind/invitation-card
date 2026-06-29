import { asc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { guestTable } from '../db/schema'
import type { GuestAdmin, GuestInput } from '../types/admin'

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateInvitationCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

function rowToGuest(row: typeof guestTable.$inferSelect): GuestAdmin {
  return {
    id: row.id,
    name: row.name,
    invitation_code: row.invitation_code,
    is_attending: row.is_attending,
    guest_type: row.guest_type,
    message: row.message,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }
}

export async function listGuests(databaseUrl: string): Promise<GuestAdmin[]> {
  const db = drizzle(databaseUrl)
  const rows = await db.select().from(guestTable).orderBy(asc(guestTable.invitation_code))
  return rows.map(rowToGuest)
}

export async function createGuest(
  databaseUrl: string,
  input: GuestInput,
): Promise<GuestAdmin> {
  const db = drizzle(databaseUrl)
  const code =
    input.invitation_code?.trim().toUpperCase() || generateInvitationCode()
  const rows = await db
    .insert(guestTable)
    .values({
      name: input.name.trim(),
      guest_type: input.guest_type.trim(),
      invitation_code: code,
      is_attending: input.is_attending ?? false,
      message: input.message?.trim() ?? '',
    })
    .returning()
  return rowToGuest(rows[0]!)
}

export async function updateGuestAdmin(
  databaseUrl: string,
  id: number,
  input: Partial<GuestInput>,
): Promise<GuestAdmin | null> {
  const db = drizzle(databaseUrl)
  const patch: Partial<typeof guestTable.$inferInsert> = {}
  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.guest_type !== undefined) patch.guest_type = input.guest_type.trim()
  if (input.invitation_code !== undefined) {
    patch.invitation_code =
      input.invitation_code === null
        ? null
        : input.invitation_code.trim().toUpperCase()
  }
  if (input.is_attending !== undefined) patch.is_attending = input.is_attending
  if (input.message !== undefined) patch.message = input.message.trim()

  const rows = await db
    .update(guestTable)
    .set(patch)
    .where(eq(guestTable.id, id))
    .returning()
  return rows[0] ? rowToGuest(rows[0]) : null
}

export async function deleteGuest(
  databaseUrl: string,
  id: number,
): Promise<boolean> {
  const db = drizzle(databaseUrl)
  const rows = await db
    .delete(guestTable)
    .where(eq(guestTable.id, id))
    .returning({ id: guestTable.id })
  return rows.length > 0
}
