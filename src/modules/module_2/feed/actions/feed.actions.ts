'use server'

import { getFeedPosts } from '../services/feed.service'
import { getUserFeedPosts } from '../services/user.feed.service'
import type { PaginatedFeed, FeedFilter } from '../types'

/** Obtiene el feed paginado, rankeado y filtrado. */
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
 

/** Obtiene posts de un usuario específico, paginados por fecha. */
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