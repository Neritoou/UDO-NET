// Funciones expuestas para otros módulos
// export { getPostById, getPostsByUser, getPostsByCommunity } from './services/post.service'
// export { getRepliesByPost, getRepliesByReply, getReplyById } from './services/reply.service'

export { mockPosts } from '@module_3/posts/services/mock-data';
export type { MockPost, MockReply } from '@module_3/posts/services/mock-data';
export { getPostsAction, createPostAction } from '@module_3/posts/actions/post';
export { getThread } from '@module_3/posts/actions/thread';
export { CreatePostProvider, useCreatePost } from '@module_3/posts/context/CreatePostContext';
export { default as PostList } from '@module_3/posts/components/PostList';
