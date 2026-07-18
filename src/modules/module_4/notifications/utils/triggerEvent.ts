import { createClient } from '@/lib/db/server';
import type { NotificationType } from '@/modules/module_4/types';

/**
 * Mapa de tipos de notificación a claves de preferencias del usuario.
 */
const typeToPreferenceKey: Record<NotificationType, string> = {
  reply: 'replies',
  vote: 'votes',
  mention: 'mentions',
  warning: 'warnings',
  report: 'reports',
};

/**
 * Crea una notificación para un usuario, respetando sus preferencias.
 * @param userId - ID del usuario destinatario de la notificación.
 * @param type - Tipo de notificación ('reply', 'vote', 'mention', 'warning', 'report').
 * @param referenceId - ID del recurso asociado (reply, post, etc.).
 * @returns El registro insertado o `null` si la preferencia está desactivada.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  referenceId: string
): Promise<{ id: string } | null> {
  try {
    // Inicializar la conexión a Supabase con la configuración oficial del equipo
    const supabase = await createClient();

    // 1. Consultar las preferencias de notificación del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error al consultar preferencias del usuario:', userError.message);
      return null;
    }

    // 2. Verificar si el usuario tiene la preferencia activada para este tipo
    const preferences = user?.notification_preferences as Record<string, boolean> | null;
    const preferenceKey = typeToPreferenceKey[type] || type;

    if (preferences && preferences[preferenceKey] === false) {
      // El usuario ha desactivado este tipo de notificación, abortar silenciosamente
      return null;
    }

    // 3. Insertar la notificación en la tabla
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

    if (insertError) {
      console.error('Error al insertar notificación:', insertError.message);
      return null;
    }

    return notification;
  } catch (error) {
    console.error('Error inesperado en createNotification:', error);
    return null;
  }
}