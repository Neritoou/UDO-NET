import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../auth/services/session-service'
import { UDO_STYLES } from '../../theme'
import { getUserProfileByUsername } from '../services/profile-service'
import { toPublicProfile } from '../utils/public-profile'
import { PersonalDataCard } from './PersonalDataCard'
import { ProfileHeader } from './ProfileHeader'
import { ReputationBadge } from './ReputationBadge'

/**
 * Pantalla de perfil en modo lectura.
 *
 * Server Component: obtiene los datos en el servidor antes de renderizar.
 * Sin `username` muestra el perfil propio; con `username`, el de otro usuario.
 * La edición vive en `/profile/edit` para que esta vista no cargue componentes
 * cliente que el visitante no necesita.
 */
export async function ProfileView({ username }: { username?: string }) {
  const currentUser = await getCurrentUser()

  // El perfil propio exige sesión: sin ella se envía al login y se vuelve después.
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

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <ProfileHeader profile={publicProfile} isOwnProfile={isOwnProfile} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="flex flex-col gap-5 lg:col-span-5">
            <PersonalDataCard profile={publicProfile} isOwnProfile={isOwnProfile} />
            <ReputationBadge userId={profile.id} reputation={profile.reputation} showProgress />
          </aside>

          <section className="lg:col-span-7">
            <div className={`${UDO_STYLES.card} flex flex-col gap-4`}>
              <h2 className="text-lg font-bold text-[#0f2748]">
                {isOwnProfile ? 'Sobre mí' : `Sobre ${profile.username}`}
              </h2>

              <p className="text-sm text-[#111827]">
                {profile.bio ??
                  (isOwnProfile
                    ? 'Todavía no has escrito tu biografía.'
                    : 'Este usuario todavía no ha escrito su biografía.')}
              </p>

              {isOwnProfile ? (
                <Link
                  href="/profile/edit"
                  className={`${UDO_STYLES.primaryButton} block text-center`}
                >
                  Editar perfil
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
