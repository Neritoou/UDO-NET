'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserId, getCurrentUser } from '../../auth/services/session-service'
import {
  isUsernameTaken,
  updateAvatarUrl,
  updateBannerUrl,
  updateUserProfile,
  deleteUserProfile
} from '../services/profile-service'
import { deleteUserAvatar, uploadUserAvatar, uploadUserBanner, deleteUserBanner } from '../services/storage-service'
import type { ProfileFormState } from '../types'

import { redirect } from 'next/navigation'
import { signOut } from '../../auth/services/auth-service'

/**
 * Server Actions para gestionar los datos del perfil.
 *
 * Todas verifican la sesión en el servidor: nunca confían en el `userId` que
 * pudiera venir del formulario, porque el cliente puede manipularlo.
 */

const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 20
const MAX_BIO_LENGTH = 300

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

/** Rutas que muestran datos del perfil y deben refrescarse tras un cambio. */
const PROFILE_PATHS = ['/', '/profile']

/** Invalida la caché de las rutas que muestran el perfil. */
function revalidateProfilePaths(): void {
  PROFILE_PATHS.forEach((path) => revalidatePath(path))
}

/** Lee un campo de texto del formulario y lo normaliza. */
function readField(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Elimina la cuenta del usuario autenticado.
 *
 * Borra la fila de `users` (cascade borra posts, replies, votes, etc.),
 * limpia Storage y cierra la sesión.
 *
 * No borra el usuario de Supabase Auth (requiere service_role).
 * Si vuelve a entrar con Google, se le crea perfil nuevo.
 */
export async function deleteAccountAction(): Promise<{ error: string } | null> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para eliminar tu cuenta.' }
 
  // Borrar fila de users PRIMERO (CASCADE borra posts, replies, votes, etc.)
  const deleted = await deleteUserProfile(user.id)
  if (!deleted) return { error: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.' }
 
  // Limpiar archivos de Storage (si falla, son huérfanos — no afectan nada)
  if (user.avatar_url) await deleteUserAvatar(user.id)
  if (user.banner_url) await deleteUserBanner(user.id)
 
  await signOut()
  redirect('/login')
}


/**
 * Actualiza el nombre de usuario, la biografía y la visibilidad del perfil.
 * Solo el dueño de la sesión puede modificar su propio perfil.
 */
export async function updateProfileAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const userId = await getCurrentUserId()
  if (!userId) return { error: 'Debes iniciar sesión para editar tu perfil.' }

  const username = readField(formData, 'username')
  const bio = readField(formData, 'bio')
  const isPublic = formData.get('is_public') === 'on'

  const fieldErrors: ProfileFormState['fieldErrors'] = {}

  if (!username) {
    fieldErrors.username = 'El nombre de usuario es obligatorio.'
  } else if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    fieldErrors.username = `Debe tener entre ${MIN_USERNAME_LENGTH} y ${MAX_USERNAME_LENGTH} caracteres.`
  } else if (!USERNAME_PATTERN.test(username)) {
    fieldErrors.username = 'Solo se permiten letras, números y guion bajo.'
  }

  if (bio.length > MAX_BIO_LENGTH) {
    fieldErrors.bio = `La biografía no puede superar los ${MAX_BIO_LENGTH} caracteres.`
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  // `null` significa que la consulta falló: sin poder descartar un duplicado
  // no se guarda, para no arriesgar dos usuarios con el mismo nombre.
  const usernameTaken = await isUsernameTaken(username, userId)
  if (usernameTaken === null) {
    return { error: 'No se pudo verificar el nombre de usuario. Inténtalo de nuevo.' }
  }
  if (usernameTaken) {
    return { fieldErrors: { username: 'Ese nombre de usuario ya está en uso.' } }
  }

  const updated = await updateUserProfile(userId, {
    username,
    bio: bio.length > 0 ? bio : null,
    is_public: isPublic,
  })

  if (!updated) return { error: 'No se pudieron guardar los cambios. Inténtalo de nuevo.' }

  revalidateProfilePaths()
  return { message: 'Perfil actualizado correctamente.' }
}

/** Sube una imagen nueva de avatar y guarda su URL en el perfil. */
export async function updateAvatarAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para cambiar tu foto.' }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return { fieldErrors: { avatar: 'Selecciona una imagen válida para subir.' } }
  }

  // Convertimos el File del FormData a Buffer para procesarlo en el servidor
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Subimos al storage (sabiendo si el usuario ya tenía avatar o no para hacer upload/replace)
  const result = await uploadUserAvatar(user.id, buffer, Boolean(user.avatar_url))
  if ('error' in result) return { fieldErrors: { avatar: result.error } }

  // Evitamos caché del navegador con la marca de tiempo
  const versionedUrl = `${result.url}?v=${Date.now()}`

  // Guardamos la nueva URL en la BD
  const saved = await updateAvatarUrl(user.id, versionedUrl)
  if (!saved) return { error: 'La imagen se subió, pero no se pudo guardar en tu perfil.' }

  await revalidateProfilePaths()
  return { message: 'Foto de perfil actualizada correctamente.' }
}

/** Elimina el avatar del usuario y restaura la imagen por defecto. */
export async function deleteAvatarAction(): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para cambiar tu foto.' }

  // Eliminamos del storage
  await deleteUserAvatar(user.id)

  // Ponemos en null la URL en la BD
  const saved = await updateAvatarUrl(user.id, null)
  if (!saved) return { error: 'No se pudo restaurar la foto por defecto.' }

  await revalidateProfilePaths()
  return { message: 'Foto de perfil eliminada.' }
}

/** Sube una imagen nueva de portada (banner) de perfil. */
export async function updateBannerAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para cambiar tu portada.' }

  const file = formData.get('banner')
  if (!(file instanceof File) || file.size === 0) {
    return { fieldErrors: { banner: 'Selecciona una imagen válida para subir.' } }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const result = await uploadUserBanner(user.id, buffer, Boolean(user.banner_url))
  if ('error' in result) return { fieldErrors: { banner: result.error } }

  const versionedUrl = `${result.url}?v=${Date.now()}`

  const saved = await updateBannerUrl(user.id, versionedUrl)
  if (!saved) return { error: 'La portada se subió, pero no se pudo guardar en tu perfil.' }

  await revalidateProfilePaths()
  return { message: 'Portada de perfil actualizada correctamente.' }
}

/** Elimina el banner del usuario. */
export async function deleteBannerAction(): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para cambiar tu portada.' }

  await deleteUserBanner(user.id)

  const saved = await updateBannerUrl(user.id, null)
  if (!saved) return { error: 'No se pudo eliminar la portada.' }

  await revalidateProfilePaths()
  return { message: 'Portada de perfil eliminada.' }
}