'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { FeedContainer } from './feed-container'
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

type SortOption = 'hot' | 'new' | 'most_replied'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'hot', label: 'Populares' },
  { value: 'new', label: 'Recientes' },
  { value: 'most_replied', label: 'Más respondidos' },
]

/**
 * Feed principal con filtros integrados.
 *
 * Filtros en dropdown, no inline — escala con más opciones.
 */
export function HomeFeedSection({
  initialFeed,
  currentUserId,
  userCommunityIds,
}: HomeFeedSectionProps) {
  const [feed, setFeed] = useState<PaginatedFeed>(initialFeed)
  const [sort, setSort] = useState<SortOption>('hot')
  const [searchText, setSearchText] = useState('')
  const [onlyMyCommunities, setOnlyMyCommunities] = useState(false)
  const [isFiltering, startFiltering] = useTransition()
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [selectedThread, setSelectedThread] = useState<UnifiedPost | null>(null)
  const [loadingThread, setLoadingThread] = useState(false)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buildFilter = (overrides?: Partial<{ sort: SortOption; search: string; onlyMine: boolean }>): FeedFilter => {
    const s = overrides?.sort ?? sort
    const q = overrides?.search ?? searchText
    const mine = overrides?.onlyMine ?? onlyMyCommunities

    const f: FeedFilter = {}
    if (s !== 'hot') f.sort = s
    if (q.trim()) f.search = q.trim()
    if (mine && userCommunityIds?.length) f.userCommunityIds = userCommunityIds
    return f
  }

  const applyFilter = (overrides?: Partial<{ sort: SortOption; search: string; onlyMine: boolean }>) => {
    startFiltering(async () => {
      const filter = buildFilter(overrides)
      const result = await getFeedAction(null, null, filter)
      setFeed(result)
    })
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setFilterOpen(false)
    applyFilter({ sort: newSort })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilter({ search: searchText })
  }

  const handleToggleMyCommunities = () => {
    const newValue = !onlyMyCommunities
    setOnlyMyCommunities(newValue)
    setFilterOpen(false)
    applyFilter({ onlyMine: newValue })
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

  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label ?? 'Populares'

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="bg-pure-white rounded-[30px] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar publicaciones..."
              className="flex-1 h-[42px] bg-lite-white text-main-black font-candal text-p px-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-regular-blue placeholder:text-gray-custom"
            />
            <button
              type="submit"
              className="h-[42px] px-5 bg-regular-blue text-pure-white font-candal text-p rounded-full border-0 hover:bg-dark-main-blue transition cursor-pointer active:scale-95"
            >
              Buscar
            </button>
          </form>

          {/* Dropdown de filtros */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="h-[42px] bg-lite-white hover:bg-white-gray text-main-black font-candal text-p px-5 rounded-full flex items-center gap-2 transition cursor-pointer border-0"
            >
              <span>Filtros:</span>
              <span className="text-regular-blue">{currentSortLabel}</span>
              <svg
                className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-pure-white rounded-[16px] shadow-lg border border-white-gray z-50 overflow-hidden">
                {/* Título */}
                <div className="px-4 py-2.5 border-b border-white-gray">
                  <span className="font-candal text-tiny text-gray-custom">Ordenar por</span>
                </div>

                {/* Opciones de orden */}
                <div className="p-2 space-y-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-candal text-tiny border-0 transition cursor-pointer ${
                        sort === opt.value
                          ? 'bg-regular-blue text-pure-white'
                          : 'bg-transparent text-main-black hover:bg-lite-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Separador + toggle mis comunidades */}
                {userCommunityIds && userCommunityIds.length > 0 && (
                  <>
                    <div className="border-t border-white-gray" />
                    <div className="p-2">
                      <button
                        onClick={handleToggleMyCommunities}
                        className={`w-full text-left px-3 py-2 rounded-xl font-candal text-tiny border-0 transition cursor-pointer ${
                          onlyMyCommunities
                            ? 'bg-deep-orange text-pure-white'
                            : 'bg-transparent text-main-black hover:bg-lite-white'
                        }`}
                      >
                        {onlyMyCommunities ? '✓ Solo mis comunidades' : 'Solo mis comunidades'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
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
          key={`${sort}-${searchText}-${onlyMyCommunities}`}
          initialData={feed}
          loadMoreAction={(cursor) => getFeedAction(null, cursor, buildFilter())}
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