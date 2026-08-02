export type PostStatus = 'open' | 'closed'

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

export type PostLink = {
  id: string
  post_id: string
  url: string
  title: string | null
  description: string | null
  image_url: string | null
  created_at: string
}
