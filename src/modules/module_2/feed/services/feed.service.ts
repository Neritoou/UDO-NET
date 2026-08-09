import { createClient } from '@/lib/db/server'
import { MaxHeap } from '../utils/max-heap'
import type { FeedPost, PaginatedFeed, FeedFilter } from '../types'

const FEED_PAGE_SIZE = 2
const MAX_CANDIDATES = 200

/**
 * Hot score: log10(replies + 1) + seconds / 45000
 */
function computeHotScore(repliesCount: number, createdAt: string): number {
  const order = Math.log10(repliesCount + 1)
  const seconds = new Date(createdAt).getTime() / 1000
  return order + seconds / 45000
}

type ScoredPost = { post: FeedPost; score: number }

/**
 * Trae posts del feed con filtros, ranking y paginación.
 *
 * Flujo:
 * 1. Query a BD con filtros aplicados (communityId, search, tag, userCommunityIds)
 * 2. Transforma a FeedPost[]
 * 3. Ordena según sort (hot/new/most_replied)
 * 4. Pagina sobre el array ordenado
 */
export async function getFeedPosts(
  communityId?: string | null,
  page: number = 0,
  limit: number = FEED_PAGE_SIZE,
  filter?: FeedFilter
): Promise<PaginatedFeed> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      status,
      is_pinned,
      created_at,
      community_id,
      author:users!posts_author_id_fkey(id, username, avatar_url),
      community:communities!posts_community_id_fkey(name, slug, parent_id),
      post_tags(tag:tags(name)),
      replies(id)
    `)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(MAX_CANDIDATES)

  // Filtrar por comunidad específica
  if (communityId) {
    query = query.eq('community_id', communityId)
  }

  // Filtrar solo posts de comunidades del usuario
  if (filter?.userCommunityIds && filter.userCommunityIds.length > 0) {
    query = query.in('community_id', filter.userCommunityIds)
  }

  // Búsqueda por texto en título/contenido
  if (filter?.search) {
    const term = filter.search.trim()
    if (term) {
      query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`)
    }
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    return { posts: [], nextCursor: null, hasMore: false }
  }

  // Resolver parent slugs
  const parentIds = [
    ...new Set(
      data
        .map((p: Record<string, unknown>) => {
          const community = p.community as { parent_id?: string | null } | null
          return community?.parent_id ?? null
        })
        .filter((id): id is string => id !== null)
    ),
  ]

  let parentInfo: Record<string, { slug: string; name: string }> = {}
  if (parentIds.length > 0) {
    const { data: parents } = await supabase
      .from('communities')
      .select('id, slug, name')
      .in('id', parentIds)

    if (parents) {
      parentInfo = Object.fromEntries(
        parents.map((p: { id: string; slug: string; name: string }) => [p.id, { slug: p.slug, name: p.name }])
      )
    }
  }

  // Transformar a FeedPost
  let allPosts: FeedPost[] = data.map((post: Record<string, unknown>) => {
    const author = post.author as { id: string; username: string; avatar_url: string | null } | null
    const community = post.community as { name: string; slug: string; parent_id: string | null } | null
    const postTags = post.post_tags as Array<{ tag: { name: string } | null }> | null
    const replies = post.replies as Array<{ id: string }> | null

    return {
      id: post.id as string,
      title: post.title as string,
      content: post.content as string | null,
      status: post.status as 'open' | 'closed',
      is_pinned: post.is_pinned as boolean,
      created_at: post.created_at as string,
      community_id: post.community_id as string,
      community_name: community?.name ?? 'General',
      community_slug: community?.slug ?? '',
      community_parent_slug: community?.parent_id
        ? (parentInfo[community.parent_id]?.slug ?? null)
        : null,
      community_parent_name: community?.parent_id
        ? (parentInfo[community.parent_id]?.name ?? null)
        : null,
      author: author ?? { id: '', username: 'Anónimo', avatar_url: null },
      tags: postTags?.map((pt) => pt.tag?.name).filter((name): name is string => Boolean(name)) ?? [],
      replies_count: replies?.length ?? 0,
    }
  })

  // Filtrar por tag (post-query porque tags están en tabla intermedia)
  if (filter?.tag) {
    const tagLower = filter.tag.toLowerCase()
    allPosts = allPosts.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tagLower)
    )
  }

  // Separar pinned del resto
  const pinned = allPosts.filter((p) => p.is_pinned)
  const regular = allPosts.filter((p) => !p.is_pinned)

  // Ordenar según filtro
  const sort = filter?.sort ?? 'hot'
  let sorted: FeedPost[]

  if (sort === 'new') {
    // Más recientes primero (ya vienen así de la query)
    sorted = regular
  } else if (sort === 'most_replied') {
    // Más respondidos primero
    sorted = [...regular].sort((a, b) => b.replies_count - a.replies_count)
  } else {
    // Hot score con MaxHeap (default)
    sorted = []
    if (regular.length > 0) {
      const heap = MaxHeap.fromArray<ScoredPost>(
        regular.map((post) => ({
          post,
          score: computeHotScore(post.replies_count, post.created_at),
        })),
        (a, b) => a.score - b.score
      )

      while (!heap.isEmpty()) {
        sorted.push(heap.extractMax()!.post)
      }
    }
  }

  const fullRanked = [...pinned, ...sorted]

  // Paginar
  const start = page * limit
  const end = start + limit
  const pageSlice = fullRanked.slice(start, end)
  const hasMore = end < fullRanked.length

  return {
    posts: pageSlice,
    nextCursor: hasMore ? String(page + 1) : null,
    hasMore,
  }
}