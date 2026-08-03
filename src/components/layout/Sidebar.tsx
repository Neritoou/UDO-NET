import { getCurrentUser } from '@module_1/auth/exports'
import { getUserMainCommunities } from '@module_2/communities/exports'
import { SidebarClient } from './SidebarClient'
import type { UserRole } from '@/lib/types'

/** Panel lateral de navegación. */
export async function Sidebar() {
  const user = await getCurrentUser()
  const communities = user ? await getUserMainCommunities(user.id) : []

  return (
    <SidebarClient
      communities={communities}
      isAuthenticated={!!user}
      userRole={user?.role ?? null}
    />
  )
}