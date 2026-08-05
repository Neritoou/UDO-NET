import { LogoutButton } from '../../auth/components/LogoutButton'
import { ROLE_LABELS } from '../../auth/utils/user-role'
import { ProfileAvatarUploader } from './ProfileAvatarUploader'
import { ProfileBannerUploader } from './ProfileBannerUploader'
import type { PublicProfile } from '../types'

/**
 * Portada y cabecera del perfil.
 *
 * Server Component con soporte para cambiar avatar y portada interactivamente.
 */
export function ProfileHeader({
  profile,
  isOwnProfile,
}: {
  profile: PublicProfile
  isOwnProfile: boolean
}) {
  return (
    <ProfileBannerUploader isOwnProfile={isOwnProfile}>
      <div className="flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <ProfileAvatarUploader
            avatarUrl={profile.avatar_url}
            username={profile.username}
            isOwnProfile={isOwnProfile}
          />

          <div className="pb-1">
            <h1 className="text-2xl font-bold text-[#0f2748]">{profile.username}</h1>
            <p className="text-sm text-[#6b7280]">
              {ROLE_LABELS[profile.role]} · {profile.reputation} puntos de reputación
            </p>
          </div>
        </div>

        {isOwnProfile ? (
          <div className="pb-1">
            <LogoutButton />
          </div>
        ) : null}
      </div>
    </ProfileBannerUploader>
  )
}
