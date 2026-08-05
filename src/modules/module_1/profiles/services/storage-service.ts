import { IMAGE_PRESETS, uploadImage, deleteImage, deleteFolder } from '@/lib/storage/server'

/**
 * Gestión del avatar del usuario sobre el bucket compartido de Supabase Storage.
 *
 * El preset `avatar` ya define ruta, tamaño y formatos permitidos, así que aquí
 * solo se valida el archivo recibido y se delega en `@/lib/storage/server`.
 *
 * (!) Solo servidor. Para resolver la URL de una foto desde un componente
 * cliente, usar `../utils/avatar`.
 */

const AVATAR_PRESET = IMAGE_PRESETS.avatar

/** Carpeta del bucket donde vive todo lo que sube un usuario. */
function getUserFolder(userId: string): string {
  return `users/${userId}`
}

/**
 * El uploader del cliente convierte la imagen a WebP antes de enviarla, por eso
 * se acepta ese tipo además de los formatos originales del preset.
 */
const ACCEPTED_TYPES: readonly string[] = [...AVATAR_PRESET.allowedTypes, 'image/webp']

/** Valida el archivo recibido en el servidor. Devuelve el mensaje de error o `null`. */
function validateAvatarFile(file: File): string | null {
  if (file.size === 0) return 'No se recibió ninguna imagen.'

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usa una imagen JPG, PNG o WebP.'
  }

  if (file.size > AVATAR_PRESET.maxSize) {
    const maxKB = AVATAR_PRESET.maxSize / 1024
    return `La imagen supera el tamaño máximo de ${maxKB} KB.`
  }

  return null
}

/**
 * Sube el avatar del usuario y devuelve su URL pública.
 *
 * No deja basura en el bucket: el preset resuelve siempre a la misma ruta
 * (`users/{id}/avatar.webp`) y la subida usa `upsert`, así que cada imagen nueva
 * sobreescribe la anterior en lugar de acumularse. La limpieza explícita de
 * `cleanupUserImages` solo hace falta para restos de implementaciones previas.
 */
export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  const validationError = validateAvatarFile(file)
  if (validationError) return { error: validationError }

  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadImage('avatar', userId, buffer)
}

/** Sube la portada del perfil del usuario y devuelve su URL pública. */
export async function uploadUserBanner(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  const validationError = validateAvatarFile(file)
  if (validationError) return { error: validationError }

  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadImage('userBanner', userId, buffer)
}

/**
 * Elimina el avatar del usuario del bucket.
 *
 * Borra primero el archivo del preset y después barre la carpeta completa, para
 * arrastrar también los avatares que quedaron con nombres antiguos y que de otro
 * modo ocuparían espacio para siempre.
 */
export async function deleteUserAvatar(userId: string): Promise<boolean> {
  const removed = await deleteImage('avatar', userId)
  await cleanupUserImages(userId)

  return removed
}

/** Vacía la carpeta de imágenes del usuario en el bucket. */
export async function cleanupUserImages(userId: string): Promise<boolean> {
  return deleteFolder(getUserFolder(userId))
}
