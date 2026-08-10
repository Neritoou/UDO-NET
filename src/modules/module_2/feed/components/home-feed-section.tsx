'use client'

import { useState, useTransition } from 'react'
import { FeedContainer } from './feed-container'
import { FeedToolbar } from './feed-toolbar'
import { getFeedAction } from '../actions/feed.actions'
import { PostCard } from '@module_3/posts/components/PostList'
import { ThreadView } from '@module_3/exports'
import { getThread } from '@module_3/posts/actions/thread'
import type { FeedPost, PaginatedFeed, FeedFilter } from '../types'
import type { UnifiedPost } from '@module_3/posts/services/supabase-service'

interface HomeFeedSectionProps {
  initialFeed: PaginatedFeed
  currentUserId?: string | null
  userCommunityIds?: string[]
  isAuthenticated?: boolean
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
    links: post.links.map((l) => ({ ...l, post_id: post.id })),
    replies: [],
    replies_count: post.replies_count,
    votes_count: 0,
  }
}

/** Feed principal con búsqueda, filtros y crear hilo. */
export function HomeFeedSection({
  initialFeed,
  currentUserId,
  userCommunityIds,
  isAuthenticated = false,
}: HomeFeedSectionProps) {
  const [feed, setFeed] = useState<PaginatedFeed>(initialFeed)
  const [currentFilter, setCurrentFilter] = useState<FeedFilter>({})
  const [isFiltering, startFiltering] = useTransition()

  const [selectedThread, setSelectedThread] = useState<UnifiedPost | null>(null)
  const [loadingThread, setLoadingThread] = useState(false)

  const handleFilterChange = (filter: FeedFilter) => {
    setCurrentFilter(filter)
    startFiltering(async () => {
      const result = await getFeedAction(null, null, filter)
      setFeed(result)
    })
  }

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
    <div className="space-y-4">
      <FeedToolbar
        onFilterChange={handleFilterChange}
        showCreateButton={isAuthenticated}
        userCommunityIds={userCommunityIds}
        searchPlaceholder="Buscar publicaciones..."
      />

      {isFiltering ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-regular-blue border-t-transparent rounded-full animate-spin" />
            <span className="font-candal text-tiny text-gray-custom">
              Filtrando publicaciones...
            </span>
          </div>
        </div>
      ) : (
        <FeedContainer
          key={JSON.stringify(currentFilter)}
          initialData={feed}
          loadMoreAction={(cursor) => getFeedAction(null, cursor, currentFilter)}
          renderPost={(post) => (
            <PostCard
              post={toUnifiedPost(post)}
              onSelectPost={openThread}
              currentUserId={currentUserId}
            />
          )}
        />
      )}
    </div>
  )
}