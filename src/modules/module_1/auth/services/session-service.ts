import {
  createUserProfile,
  getUserProfile,
  isUsernameTaken,
  updateUserProfile,
} from '../../profiles/services/profile-service'
import { clearPendingUsername, getAuthIdentity } from './auth-service'
import type { User } from '@/lib/types'

/**
 * Une la sesión de Supabase Auth con el perfil del foro.
 *
 * Se importa el servicio de perfiles por ruta interna del propio módulo 1 (no
 * por el barril) para evitar una dependencia circular entre ambos barriles.
 */

/** Longitud máxima de un nombre de usuario generado automáticamente. */
const MAX_GENERATED_USERNAME_LENGTH = 20

/**
 * Devuelve el usuario autenticado con su perfil del foro, o `null` si no hay sesión.
 * Es la función que deben usar el resto de módulos para saber quién está conectado.
 */
export async function getCurrentUser(): Promise<User | null> {
  const identity = await getAuthIdentity()
  if (!identity) return null

  return getUserProfile(identity.id)
}

/** Devuelve el id del usuario autenticado, o `null` si no hay sesión. */
export async function getCurrentUserId(): Promise<string | null> {
  const identity = await getAuthIdentity()
  return identity?.id ?? null
}

/** Indica si la petición actual pertenece a un usuario autenticado. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getAuthIdentity()) !== null
}

/**
 * Genera un nombre de usuario libre a partir del correo.
 *
 * Se añade un sufijo numérico creciente porque `users.username` es UNIQUE y el
 * registro fallaría si dos correos comparten la misma parte local.
 */
async function generateAvailableUsername(email: string): Promise<string> {
  const base =
    email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, MAX_GENERATED_USERNAME_LENGTH) || 'usuario'

  // Se compara contra `false` a propósito: `null` significa que la consulta
  // falló y no permite dar por libre el nombre.
  if ((await isUsernameTaken(base)) === false) return base

  for (let suffix = 1; suffix <= 50; suffix++) {
    const candidate = `${base}${suffix}`
    if ((await isUsernameTaken(candidate)) === false) return candidate
  }

  // Último recurso: marca de tiempo, prácticamente imposible de colisionar.
  return `${base}${Date.now().toString().slice(-6)}`
}

/**
 * Garantiza que el usuario autenticado tenga fila en la tabla `users`.
 *
 * Hace falta para cuentas creadas antes de este módulo o registradas desde el
 * panel de Supabase, que existen en Auth pero no tienen perfil en el foro.
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  preferredUsername?: string
): Promise<User | null> {
  const existing = await getUserProfile(userId)

  if (existing) return applyPendingUsername(existing, preferredUsername)

  const isPreferredFree =
    preferredUsername !== undefined && (await isUsernameTaken(preferredUsername)) === false

  const username = isPreferredFree
    ? (preferredUsername as string)
    : await generateAvailableUsername(email)

  return createUserProfile({ id: userId, email, username })
}

/**
 * Aplica al perfil el nombre que el usuario eligió al registrarse.
 *
 * Hace falta cuando el proyecto de Supabase tiene un trigger que crea la fila
 * de `users` con un nombre generado: en ese caso el nombre del formulario se
 * quedó guardado en los metadatos de Auth y se traslada aquí, en cuanto hay
 * sesión para poder escribir en la tabla.
 */
async function applyPendingUsername(
  profile: User,
  preferredUsername?: string
): Promise<User> {
  const identity = await getAuthIdentity()

  // Sin sesión no se puede escribir: el rename se hará al iniciar sesión.
  if (!identity || identity.id !== profile.id) return profile

  const desired = preferredUsername ?? identity.pendingUsername
  if (!desired || desired === profile.username) {
    if (identity.pendingUsername) await clearPendingUsername()
    return profile
  }

  // Solo se renombra si consta que el nombre está libre; con `null` (consulta
  // fallida) se deja el pendiente para reintentarlo en la siguiente sesión.
  const desiredTaken = await isUsernameTaken(desired, profile.id)
  if (desiredTaken === null) return profile

  if (desiredTaken) {
    await clearPendingUsername()
    return profile
  }

  const renamed = await updateUserProfile(profile.id, { username: desired })
  if (!renamed) return profile

  await clearPendingUsername()
  return renamed
}
