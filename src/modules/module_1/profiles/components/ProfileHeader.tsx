import { LogoutButton } from '../../auth/components/LogoutButton'
import { ROLE_LABELS } from '../../auth/utils/user-role'
import { resolveAvatarUrl } from '../utils/avatar'
import type { PublicProfile } from '../types'

/**
 * Portada y cabecera del perfil.
 *
 * Server Component: la portada es un degradado con la marca de agua "UDO" para
 * no depender de imágenes en `/public`, que está fuera de la carpeta del módulo.
 */
export function ProfileHeader({
  profile,
  isOwnProfile,
}: {
  profile: PublicProfile
  isOwnProfile: boolean
}) {
  return (
    <header className="overflow-hidden rounded-2xl border border-[#e8eff8] bg-white shadow-sm">
      <div className="relative h-40 bg-[linear-gradient(135deg,#1a3d6b_0%,#2563eb_50%,#3b82f6_100%)] md:h-52">
        <span
          className="absolute inset-0 flex select-none items-center justify-center text-[7rem] font-extrabold leading-none text-white/10 md:text-[10rem]"
          aria-hidden="true"
        >
          UDO
        </span>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          {/* Se usa <img> porque la URL del avatar depende del proyecto de Supabase configurado. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveAvatarUrl(profile.avatar_url)}
            alt={`Foto de perfil de ${profile.username}`}
            className="-mt-14 h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-md"
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
    </header>
  )
}
