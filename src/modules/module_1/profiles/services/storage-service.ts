import { IMAGE_PRESETS, uploadImage, replaceImage, deleteImage, deleteFolder } from '@/lib/storage/server'
import { createClient } from '@/lib/db/server' // O tu cliente de Supabase

/** Actualiza el avatar_url de un usuario en la BD. */
export async function updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles') // Ajusta el nombre de tu tabla de perfiles/usuarios
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (error) return false
  return true
}

/** Actualiza el banner_url de un usuario en la BD. */
export async function updateBannerUrl(userId: string, bannerUrl: string | null): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles') // Ajusta el nombre de tu tabla de perfiles/usuarios
    .update({ banner_url: bannerUrl })
    .eq('id', userId)

  if (error) return false
  return true
}

/** Sube o reemplaza el avatar de un usuario en el Storage. */
export async function uploadUserAvatar(
  userId: string,
  buffer: Buffer,
  hasExistingAvatar: boolean
): Promise<{ url: string } | { error: string }> {
  if (buffer.length > IMAGE_PRESETS.avatar.maxSize) {
    const maxKB = IMAGE_PRESETS.avatar.maxSize / 1024
    return { error: `La imagen supera el tamaño máximo de ${maxKB} KB.` }
  }

  const upload = hasExistingAvatar ? replaceImage : uploadImage
  const result = await upload('avatar', userId, buffer)
  if ('error' in result) return { error: result.error }

  return { url: result.url }
}

/** Sube o reemplaza la portada de un usuario en el Storage. */
export async function uploadUserBanner(
  userId: string,
  buffer: Buffer,
  hasExistingBanner: boolean
): Promise<{ url: string } | { error: string }> {
  if (buffer.length > IMAGE_PRESETS.userBanner.maxSize) {
    const maxMB = (IMAGE_PRESETS.userBanner.maxSize / (1024 * 1024)).toFixed(1)
    return { error: `La imagen supera el tamaño máximo de ${maxMB} MB.` }
  }

  const upload = hasExistingBanner ? replaceImage : uploadImage
  const result = await upload('userBanner', userId, buffer)
  if ('error' in result) return { error: result.error }

  return { url: result.url }
}

/** Elimina el avatar del usuario del Storage. */
export async function deleteUserAvatar(userId: string): Promise<boolean> {
  return await deleteImage('avatar', userId)
}

/** Elimina la portada del usuario del Storage. */
export async function deleteUserBanner(userId: string): Promise<boolean> {
  return await deleteImage('userBanner', userId)
}