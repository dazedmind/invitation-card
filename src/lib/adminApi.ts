import type { GuestAdmin, GuestInput } from '../types/admin'

const TOKEN_KEY = 'admin_token'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAdminToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(path, { ...init, headers })
  if (res.status === 401) clearAdminToken()
  return res
}

export async function loginAdmin(username: string, password: string) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = (await res.json()) as {
    token?: string
    error?: string
    admin?: { id: number; username: string }
  }
  if (!res.ok) {
    throw new Error(
      data.error === 'invalid_credentials'
        ? 'Invalid username or password'
        : 'Login failed',
    )
  }
  if (!data.token) throw new Error('Login failed')
  setAdminToken(data.token)
  return data.admin!
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken()
  if (!token) return false
  const res = await adminFetch('/api/admin/session')
  return res.ok
}

export async function fetchGuests(): Promise<GuestAdmin[]> {
  const res = await adminFetch('/api/admin/guests')
  if (!res.ok) throw new Error('Failed to load guests')
  const data = (await res.json()) as { guests: GuestAdmin[] }
  return data.guests
}

export async function createGuestApi(input: GuestInput): Promise<GuestAdmin> {
  const res = await adminFetch('/api/admin/guests', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create guest')
  const data = (await res.json()) as { guest: GuestAdmin }
  return data.guest
}

export async function updateGuestApi(
  id: number,
  input: Partial<GuestInput>,
): Promise<GuestAdmin> {
  const res = await adminFetch(`/api/admin/guests?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update guest')
  const data = (await res.json()) as { guest: GuestAdmin }
  return data.guest
}

export async function deleteGuestApi(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/guests?id=${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete guest')
}
