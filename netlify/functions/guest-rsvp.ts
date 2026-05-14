import { handleGuestRsvpPost } from '../../src/server/guestHttpHandlers'

const cors = (headers: Record<string, string>) => ({
  ...headers,
  'Access-Control-Allow-Origin': '*',
})

export const handler = async (event: {
  httpMethod?: string
  body?: string | null
}) => {
  const method = event.httpMethod ?? 'GET'

  if (method !== 'POST' && method !== 'OPTIONS') {
    return {
      statusCode: 405,
      headers: cors({ 'Content-Type': 'text/plain; charset=utf-8' }),
      body: 'Method Not Allowed',
    }
  }

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: cors({
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }),
      body: '',
    }
  }

  try {
    const result = await handleGuestRsvpPost(
      event.body ?? '',
      process.env.DATABASE_URL,
    )
    return {
      statusCode: result.statusCode,
      headers: cors(result.headers),
      body: result.body,
    }
  } catch {
    return {
      statusCode: 500,
      headers: cors({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'server_error' }),
    }
  }
}
