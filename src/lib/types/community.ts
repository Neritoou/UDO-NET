export type Community = {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  created_by: string | null
  created_at: string
}

export type UserCommunity = {
  user_id: string
  community_id: string
}
