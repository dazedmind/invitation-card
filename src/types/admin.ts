export type GuestAdmin = {
  id: number
  name: string
  invitation_code: string | null
  is_attending: boolean
  guest_type: string
  message: string
  created_at: string
}

export type GuestInput = {
  name: string
  guest_type: string
  invitation_code?: string | null
  is_attending?: boolean
  message?: string
}
