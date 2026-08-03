// Funciones expuestas para otros módulos
// export { getPostById, getPostsByUser, getPostsByCommunity } from './services/post.service'
// export { getRepliesByPost, getRepliesByReply, getReplyById } from './services/reply.service'

export type { UnifiedPost, DatabaseReply, DatabaseUser, ActionResponse } from '@module_3/posts/services/supabase-service';
export { getPostsAction, createPostAction } from '@module_3/posts/actions/post';
export { getThread } from '@module_3/posts/actions/thread';
export { CreatePostProvider, useCreatePost } from '@module_3/posts/context/CreatePostContext';
export { default as PostList } from '@module_3/posts/components/PostList';
export { default as ThreadView } from '@module_3/posts/components/ThreadView';
export { getPostsByUserAction } from './actions/post';

