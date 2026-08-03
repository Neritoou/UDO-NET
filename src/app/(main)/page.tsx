import { Module3Container, getPostsAction } from '@module_3/exports'
import { getUserJoinedCommunitiesAction } from '@module_3/posts/actions/post'

export default async function HomePage() {
  const [posts, communities] = await Promise.all([
    getPostsAction(),
    getUserJoinedCommunitiesAction(),
  ])

  return (
    <div className="p-4 sm:p-8">
      <Module3Container initialPosts={posts} communities={communities} />
    </div>
  )
}