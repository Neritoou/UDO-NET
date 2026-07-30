import { createClient } from '@/lib/db/server';
import type { NotificationType } from '@/lib/types/notification';

/**
 * Crea una notificación para un usuario, respetando sus preferencias.
 * @param userId - ID del usuario destinatario.
 * @param type - Tipo ('reply', 'vote', 'mention', 'warning', 'report').
 * @param referenceId - ID del recurso asociado.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  referenceId: string
) {
  try {
    const supabase = await createClient();

    // 1. Consultar las preferencias del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error al consultar preferencias:', userError?.message);
      return null;
    }

    // 2. Verificar si el usuario tiene la preferencia activada para este tipo
    const preferences = user.notification_preferences as Record<string, boolean> | null;
    
    // Si preferences existe, pero el interruptor de este tipo está en false, abortamos
    if (preferences && preferences[type] === false) {
      return null; // El usuario apagó esta notificación silenciosamente
    }

    // 3. Si está encendida (o si no tiene preferencias configuradas), insertamos
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        reference_id: referenceId,
        is_read: false,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return notification;
  } catch (error) {
    console.error('Error inesperado en createNotification:', error);
    return null;
  }
}