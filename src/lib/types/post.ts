export type PostStatus = 'abierto' | 'cerrado'

export type Post = {
  id: string
  title: string
  content: string | null
  author_id: string
  community_id: string
  status: PostStatus
  is_pinned: boolean
  is_private: boolean
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export type Tag = {
  id: string
  name: string
}

export type PostTag = {
  post_id: string
  tag_id: string
}
