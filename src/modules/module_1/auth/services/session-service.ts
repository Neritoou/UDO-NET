import {
  createUserProfile,
  getUserProfile,
  isUsernameTaken,
  updateAvatarUrl,
} from '../../profiles/services/profile-service'
import { exchangeCodeForSession, getAuthIdentity } from './auth-service'
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
 * Cierra el ciclo de OAuth: canjea el código de Google por una sesión y deja
 * al usuario con su perfil del foro listo.
 *
 * Devuelve `null` si todo salió bien, o el mensaje que hay que mostrarle.
 * La llama el Route Handler `/auth/callback`, único sitio donde se pueden
 * escribir las cookies de sesión al volver desde Google.
 */
export async function completeGoogleSignIn(code: string): Promise<{ error: string } | null> {
  const exchange = await exchangeCodeForSession(code)
  if (exchange) return exchange

  const identity = await getAuthIdentity()
  if (!identity) {
    return { error: 'No se pudo abrir la sesión con Google. Inténtalo de nuevo.' }
  }

  const profile = await ensureUserProfile(identity.id, identity.email, identity.avatarUrl)
  if (!profile) {
    return {
      error: 'Entraste con Google, pero no se pudo crear tu perfil. Contacta a un administrador.',
    }
  }

  return null
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
 * Con Google no hay formulario de registro: la primera vez que alguien entra,
 * su perfil se crea aquí con un nombre derivado del correo, que después puede
 * cambiar desde la edición de perfil.
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  googleAvatarUrl?: string | null
): Promise<User | null> {
  const existing = await getUserProfile(userId)
  if (existing) return applyGoogleAvatar(existing, googleAvatarUrl)

  const username = await generateAvailableUsername(email)
  const created = await createUserProfile({ id: userId, email, username })
  if (!created) return null

  return applyGoogleAvatar(created, googleAvatarUrl)
}

/**
 * Copia la foto de Google al perfil, pero solo si todavía no tiene ninguna.
 *
 * Nunca pisa un avatar subido por el usuario: si lo cambió desde su perfil, esa
 * elección manda sobre la foto de la cuenta de Google.
 */
async function applyGoogleAvatar(profile: User, googleAvatarUrl?: string | null): Promise<User> {
  if (!googleAvatarUrl || profile.avatar_url) return profile

  const saved = await updateAvatarUrl(profile.id, googleAvatarUrl)
  return saved ? { ...profile, avatar_url: googleAvatarUrl } : profile
}
