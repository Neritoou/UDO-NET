import type { User } from '@/lib/types'
import { getUserProfile } from '../services/profile-service'
import type { PublicProfile } from '../types'

/**
 * Reglas sobre qué datos del perfil puede ver un tercero.
 *
 * Viven fuera de `profile-service` porque eso es una decisión de negocio y el
 * servicio se limita a consultar la tabla.
 */

/** Convierte un perfil en su versión pública, ocultando el correo si es privado. */
export function toPublicProfile(profile: User): PublicProfile {
  return {
    ...profile,
    email: profile.is_public ? profile.email : null,
  }
}

/** Obtiene el perfil de un usuario tal como debe verlo un tercero. */
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const profile = await getUserProfile(userId)
  if (!profile) return null

  return toPublicProfile(profile)
}
