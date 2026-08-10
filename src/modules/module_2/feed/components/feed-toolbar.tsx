'use client'

import { useState, useRef, useEffect } from 'react'
import { useCreatePost } from '@module_3/exports'
import type { FeedFilter } from '../types'

type SortOption = 'hot' | 'new' | 'most_replied'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'hot', label: 'Populares' },
  { value: 'new', label: 'Recientes' },
  { value: 'most_replied', label: 'Más respondidos' },
]

interface FeedToolbarProps {
  onFilterChange: (filter: FeedFilter) => void
  showCreateButton?: boolean
  userCommunityIds?: string[]
  searchPlaceholder?: string
  /** Comunidad o subcomunidad actual, para preseleccionarla al crear un hilo. */
  communityId?: string | null
}

export function FeedToolbar({
  onFilterChange,
  showCreateButton = false,
  userCommunityIds,
  searchPlaceholder = 'Buscar publicaciones...',
  communityId,
}: FeedToolbarProps) {
  const [sort, setSort] = useState<SortOption>('hot')
  const [searchText, setSearchText] = useState('')
  const [onlyMyCommunities, setOnlyMyCommunities] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const { open: openCreatePost } = useCreatePost()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buildAndEmit = (overrides?: Partial<{ sort: SortOption; search: string; onlyMine: boolean }>) => {
    const s = overrides?.sort ?? sort
    const q = overrides?.search ?? searchText
    const mine = overrides?.onlyMine ?? onlyMyCommunities

    const f: FeedFilter = {}
    if (s !== 'hot') f.sort = s
    if (q.trim()) f.search = q.trim()
    if (mine && userCommunityIds?.length) f.userCommunityIds = userCommunityIds
    onFilterChange(f)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setFilterOpen(false)
    buildAndEmit({ sort: newSort })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    buildAndEmit({ search: searchText })
  }

  const handleToggleMyCommunities = () => {
    const newValue = !onlyMyCommunities
    setOnlyMyCommunities(newValue)
    setFilterOpen(false)
    buildAndEmit({ onlyMine: newValue })
  }

  const handleOpenCreatePost = () => {
    openCreatePost(communityId ? { communityId } : undefined)
  }

  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label ?? 'Populares'

  return (
    <div className="bg-pure-white rounded-[30px] p-3 sm:p-5" ref={filterRef}>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-3">
        {showCreateButton && (
          <button
            type="button"
            onClick={handleOpenCreatePost}
            className="h-[42px] px-5 bg-regular-blue text-pure-white font-candal text-p rounded-full border-0 hover:bg-dark-main-blue transition cursor-pointer active:scale-95 flex items-center gap-2 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Hilo</span>
          </button>
        )}

        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-[42px] bg-lite-white text-main-black font-candal text-p pl-4 pr-11 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-regular-blue placeholder:text-gray-custom"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-[34px] w-[34px] flex items-center justify-center rounded-full bg-regular-blue text-pure-white border-0 hover:bg-dark-main-blue transition cursor-pointer active:scale-95"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-[42px] bg-lite-white hover:bg-white-gray text-main-black font-candal text-p px-5 rounded-full flex items-center gap-2 transition cursor-pointer border-0 whitespace-nowrap"
          >
            <span>Filtros:</span>
            <span className="text-regular-blue">{currentSortLabel}</span>
            <svg className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-pure-white rounded-[16px] shadow-lg border border-white-gray z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white-gray">
                <span className="font-candal text-tiny text-gray-custom">Ordenar por</span>
              </div>
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

      {/* Mobile */}
      <div className="flex sm:hidden flex-col gap-2">
        <div className="flex items-center gap-2">
          {showCreateButton && (
            <button
              type="button"
              onClick={handleOpenCreatePost}
              className="h-[38px] w-[38px] bg-regular-blue text-pure-white rounded-full border-0 hover:bg-dark-main-blue transition cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          <form onSubmit={handleSearch} className="flex-1 relative min-w-0">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar..."
              className="w-full h-[38px] bg-lite-white text-main-black font-candal text-tiny pl-3 pr-10 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-regular-blue placeholder:text-gray-custom"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-[30px] w-[30px] flex items-center justify-center rounded-full bg-regular-blue text-pure-white border-0 hover:bg-dark-main-blue transition cursor-pointer active:scale-95"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="h-[36px] bg-lite-white hover:bg-white-gray text-main-black font-candal text-tiny px-4 rounded-full flex items-center gap-1.5 transition cursor-pointer border-0 self-start"
        >
          <span>Filtros:</span>
          <span className="text-regular-blue">{currentSortLabel}</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filterOpen && (
          <div className="bg-lite-white rounded-[16px] overflow-hidden">
            <div className="px-4 py-2 border-b border-white-gray">
              <span className="font-candal text-tiny text-gray-custom">Ordenar por</span>
            </div>
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
  )
}