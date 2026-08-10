import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../auth/services/session-service'
import { UDO_STYLES } from '../../theme'
import { AvatarUploader } from './AvatarUploader'
import { ProfileBannerUploader } from './ProfileBannerUploader'
import { ProfileEditForm } from './ProfileEditForm'
import { DeleteAccountButton } from './DeleteAccountButton'

export async function ProfileEditView() {
  const currentUser = await getCurrentUser()

  if (!currentUser) redirect('/login?redirectTo=/profile/edit')

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0f2748]">Editar perfil</h1>
          <Link href="/profile" className="text-sm font-semibold text-[#2563eb] hover:underline">
            Volver al perfil
          </Link>
        </header>

        <ProfileBannerUploader initialBannerUrl={currentUser.banner_url} isOwnProfile={true}>
          <div className="h-2" />
        </ProfileBannerUploader>

        <div className={`${UDO_STYLES.card} flex flex-col gap-6`}>
          <AvatarUploader avatarUrl={currentUser.avatar_url} username={currentUser.username} />
          <ProfileEditForm profile={currentUser} />
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="mb-2 text-sm font-bold text-gray-500">Zona de peligro</h3>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}