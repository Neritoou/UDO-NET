import { resolveAvatarUrl } from '../utils/avatar'

/** Tamaños disponibles del avatar, en clases de Tailwind. */
const AVATAR_SIZES = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-24 w-24',
  xl: 'h-28 w-28',
} as const

export type AvatarSize = keyof typeof AVATAR_SIZES

/**
 * Foto de perfil de un usuario, con la imagen por defecto si no tiene ninguna.
 *
 * Server Component sin estado, pensado para que los módulos 2, 3 y 4 muestren
 * el avatar del autor de un post, una respuesta o una notificación sin tener
 * que conocer el bucket ni la ruta de las imágenes.
 */
export function UserAvatar({
  avatarUrl,
  username,
  size = 'md',
  className,
}: {
  avatarUrl: string | null
  username: string
  size?: AvatarSize
  className?: string
}) {
  return (
    // Se usa <img> porque la URL del avatar depende del proyecto de Supabase configurado.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveAvatarUrl(avatarUrl)}
      alt={`Foto de perfil de ${username}`}
      className={`${AVATAR_SIZES[size]} shrink-0 rounded-full border border-[#e8eff8] bg-white object-cover ${className ?? ''}`}
    />
  )
}
