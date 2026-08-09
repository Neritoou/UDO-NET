import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../auth/services/session-service'
import { getUserProfileByUsername } from '../services/profile-service'
import { toPublicProfile } from '../utils/public-profile'
import { PersonalDataCard } from './PersonalDataCard'
import { ProfileHeader } from './ProfileHeader'
import { ReputationBadge } from './ReputationBadge'
import { getUserFeedAction } from '@module_2/feed/actions/feed.actions'
import { UserFeedSection } from '@module_2/feed/components/user-feed-section'

/**
 * Pantalla de perfil en modo lectura.
 *
 * Server Component: obtiene el perfil y la lista de publicaciones del usuario en el servidor.
 */
export async function ProfileView({ username }: { username?: string }) {
  const currentUser = await getCurrentUser()

  if (!username && !currentUser) redirect('/login?redirectTo=/profile')

  const profile = username ? await getUserProfileByUsername(username) : currentUser

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-3 px-4">
        <h1 className="text-xl font-bold text-[#0f2748]">Perfil no encontrado</h1>
        <p className="text-sm text-[#6b7280]">El usuario que buscas no existe o fue eliminado.</p>
        <Link href="/" className="text-sm font-semibold text-[#2563eb] hover:underline">
          Volver al inicio
        </Link>
      </main>
    )
  }

  const publicProfile = toPublicProfile(profile)
  const isOwnProfile = currentUser?.id === profile.id

  const initialFeed = await getUserFeedAction(profile.id)

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <ProfileHeader profile={publicProfile} isOwnProfile={isOwnProfile} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="flex flex-col gap-5 lg:col-span-4">
            <PersonalDataCard profile={publicProfile} isOwnProfile={isOwnProfile} />
            <ReputationBadge userId={profile.id} reputation={profile.reputation} showProgress />
          </aside>

          <section className="flex flex-col gap-4 lg:col-span-8">
            <h2 className="text-xl font-bold text-[#0f2748]">
              {isOwnProfile ? 'Mis publicaciones' : `Publicaciones de ${profile.username}`}
            </h2>

            <UserFeedSection
              initialFeed={initialFeed}
              userId={profile.id}
              currentUserId={currentUser?.id}
              isOwnProfile={isOwnProfile}
            />
          </section>
        </div>
      </div>
    </div>
  )
}