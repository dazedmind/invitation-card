import { handleAdminSessionGet } from '../../src/server/adminHttpHandlers'

const cors = (headers: Record<string, string>) => ({
  ...headers,
  'Access-Control-Allow-Origin': '*',
})

export const handler = async (event: {
  httpMethod?: string
  headers?: Record<string, string | undefined>
}) => {
  const method = event.httpMethod ?? 'GET'
  const auth =
    event.headers?.authorization ?? event.headers?.Authorization ?? null

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: cors({
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }),
      body: '',
    }
  }

  if (method !== 'GET') {
    return {
      statusCode: 405,
      headers: cors({ 'Content-Type': 'text/plain; charset=utf-8' }),
      body: 'Method Not Allowed',
    }
  }

  const result = await handleAdminSessionGet(auth, process.env.SESSION_SECRET)
  return {
    statusCode: result.statusCode,
    headers: cors(result.headers),
    body: result.body,
  }
}
