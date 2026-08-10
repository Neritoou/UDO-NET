import { createClient } from '@/lib/db/server'
import type { FeedPost, PaginatedFeed } from '../types'

const USER_FEED_PAGE_SIZE = 2

/**
 * Trae posts de un usuario específico, paginados por fecha descendente.
 *
 * No usa hot score — el perfil muestra posts del usuario ordenados
 * cronológicamente (más reciente primero).
 */
export async function getUserFeedPosts(
  userId: string,
  page: number = 0,
  limit: number = USER_FEED_PAGE_SIZE
): Promise<PaginatedFeed> {
  const supabase = await createClient()

  const { data, error } = await supabase
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
    .eq('author_id', userId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) {
    return { posts: [], nextCursor: null, hasMore: false }
  }

  // Resolver parent slugs para subcomunidades
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
  const allPosts: FeedPost[] = data.map((post: Record<string, unknown>) => {
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

  // Paginar (ya ordenados por fecha DESC desde la query)
  const start = page * limit
  const end = start + limit
  const pageSlice = allPosts.slice(start, end)
  const hasMore = end < allPosts.length

  return {
    posts: pageSlice,
    nextCursor: hasMore ? String(page + 1) : null,
    hasMore,
  }
}