import { getFeedAction } from '@module_2/feed/actions/feed.actions'
import { HomeFeedSection } from '@module_2/feed/components/home-feed-section'
import { getCurrentUserId } from '@module_1/auth/exports'
import { getUserMainCommunities } from '@module_2/communities/exports'

export default async function HomePage() {
  const currentUserId = await getCurrentUserId()

  const [initialFeed, userCommunities] = await Promise.all([
    getFeedAction(null),
    currentUserId ? getUserMainCommunities(currentUserId) : Promise.resolve([]),
  ])

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-[1000px] mx-auto">
        <HomeFeedSection
          initialFeed={initialFeed}
          currentUserId={currentUserId}
          userCommunityIds={userCommunities.map((c) => c.id)}
        />
      </div>
    </div>
  )
}