import { createClient } from '@/lib/db/server'
import type { User, UserRole } from '@/lib/types'
import type { ProfileInput, ProfileUpdate } from '../types'

/**
 * Capa de acceso a la tabla `users`, que almacena el perfil del foro.
 *
 * Cada función hace una sola consulta y devuelve el dato tal cual está en la
 * base. No hay reglas de negocio aquí: eso vive en los Server Actions y en
 * `../utils/`. Solo se ejecuta en el servidor.
 *
 * Ningún otro módulo debe consultar esta tabla directamente: deben usar las
 * funciones expuestas en `profiles/exports.ts`.
 */

/** Columnas del perfil. Se listan explícitamente para no exponer campos nuevos sin querer. */
const PROFILE_COLUMNS = 'id, email, username, avatar_url, bio, is_public, role, reputation, created_at'

/** Obtiene el perfil de un usuario por su id. */
export async function getUserProfile(userId: string): Promise<User | null> {
  if (!userId) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<User>()

  if (error) return null
  return data
}

/** Obtiene el perfil de un usuario por su nombre de usuario. */
export async function getUserProfileByUsername(username: string): Promise<User | null> {
  if (!username) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select(PROFILE_COLUMNS)
    .eq('username', username)
    .maybeSingle<User>()

  if (error) return null
  return data
}

/** Obtiene el rol de un usuario, o `null` si el perfil no existe. */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  if (!userId) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: UserRole }>()

  if (error || !data) return null
  return data.role
}

/** Obtiene la reputación de un usuario, o `null` si el perfil no existe. */
export async function getUserReputation(userId: string): Promise<number | null> {
  if (!userId) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('reputation')
    .eq('id', userId)
    .maybeSingle<{ reputation: number }>()

  if (error || !data) return null
  return data.reputation
}

/**
 * Indica si un nombre de usuario ya está ocupado.
 *
 * Devuelve `null` cuando la consulta falla, para que quien llame decida qué
 * hacer: la función no asume nada por su cuenta.
 * `excludeUserId` evita que el propio usuario choque consigo mismo al editarse.
 */
export async function isUsernameTaken(
  username: string,
  excludeUserId?: string
): Promise<boolean | null> {
  const supabase = await createClient()
  let query = supabase.from('users').select('id').eq('username', username)

  if (excludeUserId) query = query.neq('id', excludeUserId)

  const { data, error } = await query.maybeSingle<{ id: string }>()

  if (error) return null
  return data !== null
}

/**
 * Crea la fila de perfil de un usuario recién registrado.
 * El id debe ser el mismo que asignó Supabase Auth para mantener la relación.
 */
export async function createUserProfile(input: ProfileInput): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: input.id,
      email: input.email,
      username: input.username,
    })
    .select(PROFILE_COLUMNS)
    .single<User>()

  if (error) return null
  return data
}

/** Actualiza los campos editables del perfil y devuelve la versión guardada. */
export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single<User>()

  if (error) return null
  return data
}

/** Guarda la URL del avatar del usuario. Se pasa `null` para volver al avatar por defecto. */
export async function updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  return !error
}
