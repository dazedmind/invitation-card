import { handleGuestLookupGet } from '../../src/server/guestHttpHandlers'

const cors = (headers: Record<string, string>) => ({
  ...headers,
  'Access-Control-Allow-Origin': '*',
})

export const handler = async (event: {
  httpMethod?: string
  queryStringParameters?: Record<string, string | undefined> | null
  body?: string | null
}) => {
  const method = event.httpMethod ?? 'GET'

  if (method !== 'GET' && method !== 'OPTIONS') {
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }),
      body: '',
    }
  }

  try {
    const code = event.queryStringParameters?.code ?? ''
    const result = await handleGuestLookupGet(code, process.env.DATABASE_URL)
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
