import { handleAdminGuests } from '../../src/server/adminHttpHandlers'

const cors = (headers: Record<string, string>) => ({
  ...headers,
  'Access-Control-Allow-Origin': '*',
})

export const handler = async (event: {
  httpMethod?: string
  body?: string | null
  headers?: Record<string, string | undefined>
  queryStringParameters?: Record<string, string | undefined> | null
}) => {
  const method = event.httpMethod ?? 'GET'
  const auth =
    event.headers?.authorization ?? event.headers?.Authorization ?? null

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: cors({
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      }),
      body: '',
    }
  }

  try {
    const result = await handleAdminGuests(
      method,
      event.body ?? '',
      { id: event.queryStringParameters?.id },
      auth,
      process.env.DATABASE_URL,
      process.env.SESSION_SECRET,
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
