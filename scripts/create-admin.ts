import 'dotenv/config'

import { drizzle } from 'drizzle-orm/neon-http'

import { authTable } from '../src/db/schema'
import { hashPassword } from '../src/server/password'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const username = process.argv[2]
const password = process.argv[3]

if (!username || !password) {
  console.error('Usage: npx tsx scripts/create-admin.ts <username> <password>')
  process.exit(1)
}

const db = drizzle(databaseUrl)
const password_hash = await hashPassword(password)

await db.insert(authTable).values({ username, password_hash })
console.log(`Admin "${username}" created.`)
