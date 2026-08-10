'use server'

import { getFeedPosts } from '../services/feed.service'
import { getUserFeedPosts } from '../services/user.feed.service'
import type { PaginatedFeed, FeedFilter } from '../types'

/**
 * Obtiene el feed paginado, rankeado y filtrado.
 *
 * - communityId null → feed global
 * - communityId con valor → feed de comunidad/subcomunidad
 * - page → número de página (nextCursor del batch anterior)
 * - filter → filtros opcionales (sort, search, tag, userCommunityIds)
 */
export async function getFeedAction(
  communityId?: string | null,
  page?: string | null,
  filter?: FeedFilter
): Promise<PaginatedFeed> {
  try {
    const pageNum = page ? parseInt(page, 10) : 0
    return await getFeedPosts(communityId, pageNum, undefined, filter)
  } catch {
    return { posts: [], nextCursor: null, hasMore: false }
  }
}
 

/**
 * Obtiene posts de un usuario específico, paginados por fecha.
 *
 * Se usa en el perfil de usuario para mostrar sus publicaciones
 * con carga bajo demanda.
 */
export async function getUserFeedAction(
  userId: string,
  page?: string | null
): Promise<PaginatedFeed> {
  try {
    const pageNum = page ? parseInt(page, 10) : 0
    return await getUserFeedPosts(userId, pageNum)
  } catch {
    return { posts: [], nextCursor: null, hasMore: false }
  }
}