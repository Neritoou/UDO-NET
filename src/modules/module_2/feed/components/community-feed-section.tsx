'use client'

import { useState } from 'react'
import { FeedContainer } from './feed-container'
import { getFeedAction } from '../actions/feed.actions'
import { PostCard } from '@module_3/posts/components/PostList'
import { ThreadView } from '@module_3/exports'
import { getThread } from '@module_3/posts/actions/thread'
import type { FeedPost, PaginatedFeed } from '../types'
import type { UnifiedPost } from '@module_3/posts/services/supabase-service'

interface CommunityFeedSectionProps {
  initialFeed: PaginatedFeed
  communityId?: string | null
  currentUserId?: string | null
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
 * Sección del feed para comunidades y subcomunidades.
 *
 * Sin filtros — las comunidades muestran el feed rankeado por hot score.
 */
export function CommunityFeedSection({
  initialFeed,
  communityId,
  currentUserId,
}: CommunityFeedSectionProps) {
  const [selectedThread, setSelectedThread] = useState<UnifiedPost | null>(null)
  const [loadingThread, setLoadingThread] = useState(false)

  const openThread = async (id: string) => {
    setLoadingThread(true)
    const thread = await getThread(id)
    setSelectedThread(thread)
    setLoadingThread(false)
  }

  if (loadingThread) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-regular-blue border-t-transparent rounded-full animate-spin" />
        <p className="font-candal font-normal text-p text-gray-custom">
          Cargando publicación...
        </p>
      </div>
    )
  }

  if (selectedThread) {
    return (
      <ThreadView
        threadId={selectedThread.id}
        initialThread={selectedThread}
        onBack={() => setSelectedThread(null)}
        currentUserId={currentUserId}
      />
    )
  }

  return (
    <FeedContainer
      initialData={initialFeed}
      loadMoreAction={(cursor) => getFeedAction(communityId, cursor)}
      renderPost={(post) => (
        <PostCard
          post={toUnifiedPost(post)}
          onSelectPost={openThread}
          currentUserId={currentUserId}
        />
      )}
    />
  )
}