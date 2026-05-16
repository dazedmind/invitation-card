import { handleAdminLoginPost } from '../../src/server/adminHttpHandlers'

const cors = (headers: Record<string, string>) => ({
  ...headers,
  'Access-Control-Allow-Origin': '*',
})

export const handler = async (event: {
  httpMethod?: string
  body?: string | null
}) => {
  const method = event.httpMethod ?? 'GET'

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: cors({
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }),
      body: '',
    }
  }

  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: cors({ 'Content-Type': 'text/plain; charset=utf-8' }),
      body: 'Method Not Allowed',
    }
  }

  const result = await handleAdminLoginPost(
    event.body ?? '',
    process.env.DATABASE_URL,
    process.env.SESSION_SECRET,
  )
  return {
    statusCode: result.statusCode,
    headers: cors(result.headers),
    body: result.body,
  }
}
