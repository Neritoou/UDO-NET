export type Reply = {
  id: string
  content: string
  user_id: string
  post_id: string
  parent_id: string | null
  vote_count: number
  is_edited: boolean
  is_hidden: boolean
  created_at: string
  edited_at: string | null
}
