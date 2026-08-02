import Link from 'next/link'
import { ROLE_LABELS } from '../../auth/utils/user-role'
import { resolveAvatarUrl } from '../utils/avatar'
import type { PublicProfile } from '../types'

/**
 * Tarjeta compacta de un usuario: avatar, nombre, rol y reputación.
 *
 * Server Component pensado para que otros módulos muestren al autor de un post
 * o de una respuesta sin tener que consultar la tabla `users`.
 */
export function ProfileCard({
  profile,
  showBio = false,
}: {
  profile: PublicProfile
  /** Añade la biografía debajo del nombre. */
  showBio?: boolean
}) {
  return (
    <article className="flex items-start gap-3 rounded-xl border border-[#e8eff8] bg-white p-3">
      {/* Se usa <img> porque la URL del avatar depende del proyecto de Supabase configurado. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveAvatarUrl(profile.avatar_url)}
        alt={`Foto de perfil de ${profile.username}`}
        className="h-11 w-11 shrink-0 rounded-full border border-[#e8eff8] object-cover"
      />

      <div className="flex min-w-0 flex-col">
        <Link
          href={`/profile/${profile.username}`}
          className="truncate text-sm font-semibold text-[#0f2748] hover:text-[#2563eb] hover:underline"
        >
          {profile.username}
        </Link>
        <p className="text-xs text-[#6b7280]">
          {ROLE_LABELS[profile.role]} · {profile.reputation} pts
        </p>

        {showBio && profile.bio ? (
          <p className="mt-1 text-xs text-[#111827]">{profile.bio}</p>
        ) : null}
      </div>
    </article>
  )
}
