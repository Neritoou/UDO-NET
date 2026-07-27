import { createClient } from '@/lib/db/server';
import type { NotificationType } from '@/modules/module_4/types';

const typeToPreferenceKey: Record<NotificationType, string> = {
  reply: 'replies',
  vote: 'votes',
  mention: 'mentions',
  warning: 'warnings',
  report: 'reports',
};

interface NotificationPayload {
  userId: string;       // Destinatario
  actorId: string;      // Quién genera el evento (Emisor)
  type: NotificationType;
  referenceId: string;  // ID del post, comentario, etc.
}

export const notificationService = {
  async createNotification(payload: NotificationPayload): Promise<{ id: string } | null> {
    const { userId, actorId, type, referenceId } = payload;

    // CORRECCIÓN 2: No auto-notificarse
    if (userId === actorId) return null;

    try {
      const supabase = await createClient();

      // ----------------------------------------------------------------
      // 1. QUERY: Verificar Bloqueos entre usuarios
      // ----------------------------------------------------------------
      const { data: isBlocked } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', userId)
        .eq('blocked_id', actorId)
        .maybeSingle();

      if (isBlocked) return null; // El destinatario tiene bloqueado al emisor

      // ----------------------------------------------------------------
      // 2. QUERY: Consultar preferencias del usuario destinatario
      // ----------------------------------------------------------------
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      if (userError || !user) return null;

      const preferences = user.notification_preferences as Record<string, boolean> | null;
      const preferenceKey = typeToPreferenceKey[type] || type;

      if (preferences && preferences[preferenceKey] === false) {
        return null; // Preferencia desactivada
      }

      // ----------------------------------------------------------------
      // 3. QUERY: Control de Spam / Debouncing (Evitar duplicados recientes)
      // ----------------------------------------------------------------
      if (type === 'vote') {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: recentNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('actor_id', actorId)
          .eq('type', type)
          .eq('reference_id', referenceId)
          .gte('created_at', fiveMinutesAgo)
          .maybeSingle();

        // Si ya se notificó este voto hace menos de 5 min, actualizamos el timestamp para no duplicar
        if (recentNotification) {
          await supabase
            .from('notifications')
            .update({ created_at: new Date().toISOString(), is_read: false })
            .eq('id', recentNotification.id);
          
          return { id: recentNotification.id };
        }
      }

      // ----------------------------------------------------------------
      // 4. QUERY: Inserción final con trazabilidad completa
      // ----------------------------------------------------------------
      const { data: notification, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: actorId, // Guardamos quién generó la alerta
          type,
          reference_id: referenceId,
          is_read: false,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return notification;
    } catch (error) {
      console.error('Error en el servicio de notificaciones:', error);
      return null;
    }
  }
};
