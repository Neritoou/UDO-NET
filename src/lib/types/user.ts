export type UserRole = 'regular' | 'moderator' | 'admin'

export type User = {
  id: string
  email: string
  username: string
  avatar_url: string | null
  bio: string | null
  is_public: boolean
  role: UserRole
  reputation: number
  created_at: string
}
