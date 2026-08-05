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
    const { data: user } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    // Si el usuario tiene preferencias configuradas y desactivó explícitamente este tipo, se aborta.
    const preferences = user?.notification_preferences as Record<string, boolean> | null;
    if (preferences && typeof preferences === 'object' && preferences[type] === false) {
      return null;
    }

    // El usuario tiene este tipo activado (o no tiene preferencias explícitamente configuradas). Se inserta el registro.
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        reference_id: referenceId,
        is_read: false,
      });

    if (insertError) {
      console.error('Error al insertar notificación:', insertError.message);
      return null;
    }

    return true;
  } catch (err) {
    console.error('Error en createNotification:', err);
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

  // Resolver el post_id objetivo para notificaciones de tipo 'vote'
  const voteReplyIds = data
    .filter((n) => n.type === 'vote' && n.reference_id)
    .map((n) => n.reference_id as string)

  let replyToPostMap: Record<string, string> = {}

  if (voteReplyIds.length > 0) {
    const { data: replyRows } = await supabase
      .from('replies')
      .select('id, post_id')
      .in('id', voteReplyIds)

    if (replyRows) {
      replyToPostMap = replyRows.reduce((acc: Record<string, string>, r: any) => {
        acc[r.id] = r.post_id
        return acc
      }, {})
    }
  }

  return data.map((n) => ({
    ...n,
    target_post_id: n.type === 'vote' && n.reference_id ? (replyToPostMap[n.reference_id] || null) : n.reference_id
  }))
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