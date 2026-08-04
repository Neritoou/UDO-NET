import { CreatePostProvider, getPostsAction } from '@module_3/exports';
import { getUserJoinedCommunitiesAction } from '@module_3/posts/actions/post';
import { getCurrentUserId } from '@module_1/auth/exports';
import HomeFeed from '@module_3/posts/components/HomeFeed';
import { Suspense } from 'react';

export default async function HomePage() {
  const [posts, communities, currentUserId] = await Promise.all([
    getPostsAction(),
    getUserJoinedCommunitiesAction(),
    getCurrentUserId(),
  ]);

  return (
    <CreatePostProvider communities={communities}>
      <div className="p-4 sm:p-8">
        <Suspense fallback={<div className="max-w-[1000px] mx-auto p-12 text-center font-candal text-gray-custom">Cargando publicaciones...</div>}>
          <HomeFeed initialPosts={posts} currentUserId={currentUserId} />
        </Suspense>
      </div>
    </CreatePostProvider>
  );
}