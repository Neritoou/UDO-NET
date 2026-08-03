import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../auth/services/session-service'
import { UDO_STYLES } from '../../theme'
import { AvatarUploader } from './AvatarUploader'
import { ProfileEditForm } from './ProfileEditForm'

/**
 * Pantalla dedicada a editar el perfil propio.
 *
 * Server Component: obtiene el perfil antes de renderizar y solo entonces monta
 * los componentes cliente (`AvatarUploader` y `ProfileEditForm`), que reciben
 * los valores iniciales ya resueltos.
 */
export async function ProfileEditView() {
  const currentUser = await getCurrentUser()

  // Sin sesión no hay nada que editar: se envía al login y se vuelve después.
  if (!currentUser) redirect('/login?redirectTo=/profile/edit')

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0f2748]">Editar perfil</h1>
          <Link
            href="/profile"
            className="text-sm font-semibold text-[#2563eb] hover:underline"
          >
            Volver al perfil
          </Link>
        </header>

        <div className={`${UDO_STYLES.card} flex flex-col gap-6`}>
          <AvatarUploader avatarUrl={currentUser.avatar_url} username={currentUser.username} />

          <ProfileEditForm profile={currentUser} />
        </div>
      </div>
    </div>
  )
}
