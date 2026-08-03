// --- Componentes ---
export { default as PostList } from './posts/components/PostList'
export { default as ThreadView } from './posts/components/ThreadView'
export { default as SearchInput } from './search/components/SearchInput'
export { default as SearchBox } from './search/components/SearchBox'

// --- Context (client-only) ---
export { CreatePostProvider, useCreatePost } from './posts/context/CreatePostContext'

// --- Tipos ---
export type { UnifiedPost, DatabaseReply, DatabaseUser, ActionResponse } from './posts/services/supabase-service'