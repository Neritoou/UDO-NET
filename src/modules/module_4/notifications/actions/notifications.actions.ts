'use server';

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@module_1/auth/exports';

/**
 * Server Action: Marca una o varias notificaciones como leídas para el usuario actual.
 */
export async function markNotificationsAsRead(notificationIds?: string[]) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return { success: false, error: 'Debes iniciar sesión.' };
    }

    const supabase = await createClient();

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId)
      .eq('is_read', false);

    if (notificationIds && notificationIds.length > 0) {
      query = query.in('id', notificationIds);
    }

    const { error } = await query;

    if (error) {
      return { success: false, error: 'Error al actualizar las notificaciones.' };
    }

    revalidatePath('/', 'layout');

    return { success: true };
  } catch {
    return { success: false, error: 'Error interno del servidor.' };
  }
}