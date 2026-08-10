/** Post tal como se muestra en el feed — sin replies ni votes individuales. */
export type FeedPost = {
  id: string
  title: string
  content: string | null
  status: 'open' | 'closed'
  is_pinned: boolean
  created_at: string
  community_id: string
  community_name: string
  community_slug: string
  community_parent_slug: string | null
  community_parent_name: string | null
  author: {
    id: string
    username: string
    avatar_url: string | null
  }
  tags: string[]
  replies_count: number
}
 
/** Resultado paginado del feed. */
export type PaginatedFeed = {
  posts: FeedPost[]
  nextCursor: string | null
  hasMore: boolean
}
 
/** Filtros aplicables al feed. */
export type FeedFilter = {
  /** Orden: hot (default), new, most_replied */
  sort?: 'hot' | 'new' | 'most_replied'
  /** Búsqueda por texto en título/contenido */
  search?: string
  /** Filtrar por tag */
  tag?: string
  /** Solo posts de comunidades del usuario */
  userCommunityIds?: string[]
}