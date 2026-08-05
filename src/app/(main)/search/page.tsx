import { search } from '@/modules/module_3/posts/services/post.service';
import SearchBox from '@/modules/module_3/search/components/SearchBox';
import PostList from '@/modules/module_3/posts/components/PostList';
import { getUserJoinedCommunitiesAction } from '@module_3/posts/actions/post';
import { getCurrentUserId } from '@module_1/auth/exports';
import { CreatePostProvider } from '@module_3/exports';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; filter?: string; tag?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', filter = 'most_replied', tag } = await searchParams;

  const [posts, communities, currentUserId] = await Promise.all([
    search(q, undefined, tag ? [tag] : undefined, filter),
    getUserJoinedCommunitiesAction(),
    getCurrentUserId(),
  ]);

  return (
    <CreatePostProvider communities={communities}>
      <div className="mx-auto max-w-[1000px] p-4 sm:p-8">
        <SearchBox>
          <PostList posts={posts} currentUserId={currentUserId} />
        </SearchBox>
      </div>
    </CreatePostProvider>
  );
}
