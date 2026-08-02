import { IMAGE_PRESETS } from '@/lib/storage/client'

/**
 * Utilidades del avatar que no tocan el servidor.
 *
 * Viven separadas de `storage-service` porque ese archivo importa el cliente de
 * Supabase para servidor (`next/headers`), y eso rompe cualquier componente
 * marcado con 'use client' que necesite resolver la URL de una foto.
 */

/** URL del avatar que se muestra cuando el usuario no ha subido ninguno. */
export const DEFAULT_AVATAR_URL = IMAGE_PRESETS.avatar.defaultUrl

/** Devuelve la URL del avatar recibido o la imagen por defecto si no tiene. */
export function resolveAvatarUrl(avatarUrl: string | null | undefined): string {
  return avatarUrl && avatarUrl.length > 0 ? avatarUrl : DEFAULT_AVATAR_URL
}
