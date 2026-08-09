'use client'

import { FeedContainer } from './feed-container'
import { getUserFeedAction } from '../actions/feed.actions'
import { PostCard } from '@module_3/posts/components/PostList'
import type { FeedPost, PaginatedFeed } from '../types'
import type { UnifiedPost } from '@module_3/posts/services/supabase-service'

interface UserFeedSectionProps {
  initialFeed: PaginatedFeed
  userId: string
  currentUserId?: string | null
  isOwnProfile?: boolean
}

/** Convierte FeedPost a UnifiedPost para PostCard. */
function toUnifiedPost(post: FeedPost): UnifiedPost {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    status: post.status as 'open' | 'closed',
    is_pinned: post.is_pinned,
    is_private: false,
    is_hidden: false,
    created_at: post.created_at,
    updated_at: post.created_at,
    author_id: post.author.id,
    community_id: post.community_id,
    community_name: post.community_name,
    community_slug: post.community_slug,
    community_parent_slug: post.community_parent_slug,
    community_parent_name: post.community_parent_name,
    author: {
      id: post.author.id,
      username: post.author.username,
      avatar_url: post.author.avatar_url,
    },
    tags: post.tags,
    replies: [],
    links: [],
    replies_count: post.replies_count,
    votes_count: 0,
  }
}

/**
 * Sección del feed para el perfil de usuario.
 *
 * Muestra posts del usuario con carga bajo demanda.
 * No usa hot score — ordena por fecha descendente.
 */
export function UserFeedSection({
  initialFeed,
  userId,
  currentUserId,
  isOwnProfile = false,
}: UserFeedSectionProps) {
  return (
    <FeedContainer
      initialData={initialFeed}
      loadMoreAction={(cursor) => getUserFeedAction(userId, cursor)}
      emptyMessage={
        isOwnProfile
          ? 'Aún no has realizado ninguna publicación.'
          : 'Este usuario aún no tiene publicaciones.'
      }
      endMessage="No hay más publicaciones por mostrar."
      renderPost={(post) => (
        <PostCard
          post={toUnifiedPost(post)}
          currentUserId={currentUserId}
          isCompact
        />
      )}
    />
  )
}