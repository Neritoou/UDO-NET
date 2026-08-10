'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@module_1/auth/exports'
import { getUserNotifications, markNotificationsRead } from '../services/notification.service';

/**
 * Server Action: Marca una o varias notificaciones como leídas para el usuario actual.
 *
 * Si se proveen IDs en `notificationIds` y el arreglo no está vacío, solo se actualizan
 * esas notificaciones específicas. Si el arreglo está ausente o vacío, se marcan como
 * leídas todas las notificaciones no leídas del usuario actual.
 *
 * Utiliza la política RLS de Supabase "Users can update their notifications" para garantizar
 * que cada usuario solo pueda modificar sus propios registros.
 *
 * @param notificationIds - Arreglo opcional de UUIDs de notificaciones a marcar como leídas.
 * @returns Objeto con `success: true` al completarse, o `success: false` con un string de error.
 */
export async function markNotificationsAsRead(notificationIds?: string[]) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return { success: false, error: 'Debes iniciar sesión.' };

    const success = await markNotificationsRead(currentUserId, notificationIds);
    if (!success) return { success: false, error: 'Error al actualizar las notificaciones.' };

    // Revalida el layout para que los contadores de notificaciones renderizados en el servidor se actualicen.
    revalidatePath('/', 'layout');

    return { success: true };
  } catch {
    return { success: false, error: 'Error interno del servidor.' };
  }
}

/**
 * Server Action: obtiene las notificaciones del usuario actual.
 * Wrapper de getUserNotifications para poder llamarla desde un Client Component (polling).
 */
export async function getUserNotificationsAction(limit: number = 20) {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return [];

  return getUserNotifications(currentUserId, limit);
}