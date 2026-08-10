'use client'

import { useState, useTransition } from 'react'
import type { FeedPost, PaginatedFeed } from '../types'

type FeedContainerProps = {
  initialData: PaginatedFeed
  /** Función que carga la siguiente página. Recibe el cursor (page number). */
  loadMoreAction: (cursor: string) => Promise<PaginatedFeed>
  /** Render prop: cada página decide cómo renderizar un post. */
  renderPost: (post: FeedPost) => React.ReactNode
  /** Mensaje cuando no hay posts. */
  emptyMessage?: string
  /** Mensaje cuando se llega al final. */
  endMessage?: string
}

/**
 * Contenedor genérico del feed con carga bajo demanda.
 *
 * Reutilizable: comunidades, subcomunidades, feed global, perfil de usuario.
 */
export function FeedContainer({
  initialData,
  loadMoreAction,
  renderPost,
  emptyMessage = 'No hay publicaciones aún. ¡Sé el primero en publicar!',
  endMessage = 'No hay más publicaciones por mostrar.',
}: FeedContainerProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialData.posts)
  const [cursor, setCursor] = useState<string | null>(initialData.nextCursor)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [isPending, startTransition] = useTransition()

  const loadMore = () => {
    if (!cursor || isPending) return

    startTransition(async () => {
      const result = await loadMoreAction(cursor)
      setPosts((prev) => [...prev, ...result.posts])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    })
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-pure-white p-8 text-center">
        <p className="font-candal text-tiny text-gray-custom">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <div key={post.id}>
          {renderPost(post)}
        </div>
      ))}

      {hasMore ? (
        <div className="flex flex-col items-center gap-2 pt-2">
          {isPending ? (
            <div className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 border-3 border-regular-blue border-t-transparent rounded-full animate-spin" />
              <span className="font-candal text-tiny text-gray-custom">
                Cargando publicaciones...
              </span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="rounded-full bg-regular-blue px-6 py-2 text-sm font-semibold text-pure-white transition hover:bg-dark-main-blue active:scale-95"
            >
              Cargar más publicaciones
            </button>
          )}
        </div>
      ) : posts.length > 0 && (
        <p className="py-4 text-center font-candal text-tiny text-gray-custom">
          {endMessage}
        </p>
      )}
    </div>
  )
}