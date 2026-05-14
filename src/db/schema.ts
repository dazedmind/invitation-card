import { pgTable, integer, varchar, boolean, timestamp, text } from "drizzle-orm/pg-core";

export const guestTable = pgTable("guests", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    invitation_code: varchar({ length: 255 }),
    is_attending: boolean().notNull().default(false),
    guest_type: varchar({ length: 255 }).notNull(),
    message: text().notNull().default(''),
    created_at: timestamp().notNull().defaultNow(),
});