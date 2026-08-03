import { createClient } from '@/lib/db/server';
import type { NotificationType, Notification} from '@/lib/types/notification';

/**
 * Crea una notificación para un usuario destinatario, respetando sus preferencias guardadas.
 *
 * Primero consulta la columna `notification_preferences` (JSONB) del usuario.
 * Si el usuario ha desactivado explícitamente el tipo de notificación, el insert
 * se omite de forma silenciosa. Si las preferencias no existen o el tipo está activado,
 * se inserta una nueva fila en la tabla `notifications`.
 *
 * @param userId - UUID del destinatario de la notificación (referencia a users.id).
 * @param type - Categoría de la notificación: 'reply' | 'vote' | 'warning' | 'report' | 'mention'.
 * @param referenceId - UUID del recurso asociado (reply_id, post_id, etc.).
 * @returns El objeto de notificación recién creado, o null si fue omitido o hubo un fallo.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  referenceId: string
) {
  try {
    const supabase = await createClient();

    // Consulta las preferencias de notificación del usuario desde la tabla users.
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      // No se pueden verificar las preferencias; se omite la notificación para no insertar sin consentimiento.
      return null;
    }

    // Si el usuario tiene preferencias configuradas y desactivó este tipo, se aborta.
    const preferences = user.notification_preferences as Record<string, boolean> | null;
    if (preferences && preferences[type] === false) {
      return null;
    }

    // El usuario tiene este tipo de notificación activado (o no tiene preferencias definidas). Se inserta el registro.
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
  } catch {
    // Se retorna null para que los componentes que llamen a esta función puedan continuar sin fallar.
    return null;
  }
}

/**
 * Obtiene las notificaciones de un usuario, ordenadas por fecha descendente.
 */
export async function getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data
}

/**
 * Obtiene la cantidad de notificaciones no leídas de un usuario.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) return 0
  return count ?? 0
}