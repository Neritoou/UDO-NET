import Link from 'next/link'
import { formatDate } from '@/lib/utils/formatDate'
import { ROLE_LABELS } from '../../auth/utils/user-role'
import { candal } from '../../fonts'
import type { PublicProfile } from '../types'

/**
 * Lista con los datos personales guardados en el perfil.
 *
 * Server Component. Solo muestra los campos que existen en la tabla `users`;
 * los que el usuario no ha rellenado aparecen como "No especificado" con un
 * atajo para editarlos, siguiendo el estado vacío del prototipo.
 */
export function PersonalDataCard({
  profile,
  isOwnProfile,
}: {
  profile: PublicProfile
  /** Habilita los enlaces de edición del estado vacío. */
  isOwnProfile: boolean
}) {
  const rows = [
    { label: 'Nombre de usuario', value: profile.username },
    { label: 'Correo', value: profile.email },
    { label: 'Rol', value: ROLE_LABELS[profile.role] },
    { label: 'Reputación', value: `${profile.reputation} puntos` },
    { label: 'Visibilidad', value: profile.is_public ? 'Perfil público' : 'Perfil privado' },
    { label: 'Biografía', value: profile.bio },
    { label: 'Miembro desde', value: formatDate(profile.created_at) },
  ]

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
        <h2 className={`${candal.className} text-lg font-bold text-[#0f2748]`}>Datos Personales</h2>

        {isOwnProfile ? (
          <Link href="/profile/edit" className="text-xs font-bold text-blue-500 hover:underline">
            Editar
          </Link>
        ) : null}
      </div>

      <ul className="divide-y divide-gray-100">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm font-bold text-gray-700">{row.label}:</span>

            {row.value ? (
              <span className="max-w-[180px] break-words text-right text-sm font-medium text-gray-800">
                {row.value}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-sm italic text-gray-400">No especificado</span>

                {isOwnProfile ? (
                  <Link
                    href="/profile/edit"
                    aria-label={`Completar ${row.label}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 hover:bg-blue-200"
                  >
                    +
                  </Link>
                ) : null}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
