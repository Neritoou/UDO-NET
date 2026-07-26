'use server'; // 👈 Obligatorio al inicio del archivo

import { createClient } from '@/lib/db/server';
import type { MarkReadPayload } from '@/modules/module_4/types';

/**
 * Obtiene las últimas 20 notificaciones del usuario actual,
 * ordenadas por fecha de creación descendente.
 */
export async function getNotifications(currentUserId: string) {
  try {
    if (!currentUserId) {
      return { success: false, error: 'No se proporcionó el ID del usuario.' };
    }

    const supabase = await createClient();

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error al consultar notificaciones:', error.message);
      return { success: false, error: 'Error al obtener las notificaciones.' };
    }

    return { success: true, notifications };
  } catch (error) {
    console.error('Error inesperado en getNotifications:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}

/**
 * Marca las notificaciones como leídas.
 * Si se envía un array de IDs, marca solo esas.
 * Si el array está vacío o no se envía, marca TODAS las del usuario.
 */
export async function markNotificationsAsRead(currentUserId: string, payload: MarkReadPayload = {}) {
  try {
    if (!currentUserId) {
      return { success: false, error: 'No se proporcionó el ID del usuario.' };
    }

    const supabase = await createClient();
    const { notificationIds } = payload;

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId);

    // Si se proporcionan IDs específicos, filtrar por ellos
    if (notificationIds && notificationIds.length > 0) {
      query = query.in('id', notificationIds);
    }

    const { error } = await query;

    if (error) {
      console.error('Error al marcar notificaciones como leídas:', error.message);
      return { success: false, error: 'Error al actualizar las notificaciones.' };
    }

    return { success: true, message: 'Notificaciones marcadas como leídas.' };
  } catch (error) {
    console.error('Error inesperado en markNotificationsAsRead:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}
