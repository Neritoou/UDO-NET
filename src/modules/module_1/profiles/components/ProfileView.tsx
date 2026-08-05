import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../auth/services/session-service'
import { getUserProfileByUsername } from '../services/profile-service'
import { toPublicProfile } from '../utils/public-profile'
import { PersonalDataCard } from './PersonalDataCard'
import { ProfileHeader } from './ProfileHeader'
import { ReputationBadge } from './ReputationBadge'
import { getPostsByUser } from '@/modules/module_3/posts/services/post.service'
import { PostCard } from '@/modules/module_3/posts/components/PostList'

/**
 * Pantalla de perfil en modo lectura.
 *
 * Server Component: obtiene el perfil y la lista de publicaciones del usuario en el servidor.
 * Reemplaza la sección "Sobre mí" por las publicaciones recientes del usuario.
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

  // Obtener las publicaciones del usuario desde el Módulo 3
  const userPosts = await getPostsByUser(profile.id)

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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0f2748]">
                {isOwnProfile ? 'Mis publicaciones' : `Publicaciones de ${profile.username}`}
              </h2>
              <span className="text-xs font-semibold text-[#6b7280]">
                {userPosts.length} {userPosts.length === 1 ? 'publicación' : 'publicaciones'}
              </span>
            </div>

            {userPosts.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="font-bold text-[#0f2748]">
                  {isOwnProfile
                    ? 'Aún no has realizado ninguna publicación'
                    : 'Este usuario aún no tiene publicaciones'}
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {isOwnProfile
                    ? 'Tus publicaciones aparecerán aquí cuando compartas contenido en la plataforma.'
                    : ''}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={currentUser?.id} isCompact />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
