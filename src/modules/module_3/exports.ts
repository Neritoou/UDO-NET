// Exportaciones públicas del Módulo 3

export { default as Module3Container } from './components/ModuleContainer';
export { searchPosts, SearchInput, SearchBox } from './search/exports';
export type { UnifiedPost, DatabaseReply, DatabaseUser, ActionResponse } from '@module_3/posts/services/supabase-service';
export { CreatePostProvider, useCreatePost, PostList, ThreadView } from './posts/exports';
export { getPostsAction, createPostAction, getPostsByUserAction } from './posts/actions/post';
