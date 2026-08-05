import type { User } from '@/lib/types'

/**
 * Tipos propios del submódulo de perfiles.
 *
 * El perfil en sí es el tipo `User` de `@/lib/types`: no se define un alias ni
 * una copia, para que todos los módulos hablen exactamente del mismo contrato.
 */

/**
 * Perfil visible para terceros.
 * El correo se omite cuando el usuario mantiene su perfil privado.
 */
export type PublicProfile = Omit<User, 'email'> & {
  email: string | null
}

/** Campos que el propio usuario puede modificar de su perfil. */
export type ProfileUpdate = {
  username?: string
  bio?: string | null
  is_public?: boolean
}

/** Datos necesarios para crear la fila de perfil de un usuario recién registrado. */
export type ProfileInput = {
  id: string
  email: string
  username: string
}

/** Nivel de reputación alcanzado por un usuario. */
export type ReputationLevel = 'novice' | 'contributor' | 'expert' | 'mentor'

/** Insignia asociada a un nivel de reputación. */
export type ReputationBadgeInfo = {
  level: ReputationLevel
  title: string
  description: string
  /** Reputación mínima necesaria para alcanzar la insignia. */
  minReputation: number
}

/**
 * Reputación de un usuario junto a la insignia que le corresponde.
 *
 * Es el resultado de `buildUserReputation`, no lo que devuelve la consulta:
 * `getUserReputation` retorna el puntaje numérico tal cual está en la tabla.
 */
export type UserReputation = {
  userId: string
  score: number
  badge: ReputationBadgeInfo
  /** Insignia siguiente, o `null` si ya alcanzó la más alta. */
  nextBadge: ReputationBadgeInfo | null
  /** Progreso hacia la siguiente insignia, entre 0 y 100. */
  progress: number
}

/** Campos del formulario de perfil que pueden tener un error individual. */
export type ProfileField = 'username' | 'bio' | 'avatar' | 'banner'

/** Estado que los Server Actions de perfil devuelven a los formularios. */
export type ProfileFormState = {
  error?: string
  fieldErrors?: Partial<Record<ProfileField, string>>
  message?: string
}

/** Estado inicial de los formularios de perfil. */
export const INITIAL_PROFILE_STATE: ProfileFormState = {}
