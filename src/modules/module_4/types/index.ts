/**
 * Interfaces TypeScript para el Módulo 4 de UDOnet.
 */

/** Modelo de Usuario - mapea con la tabla `users` */
export interface User {
  id: string;
  role: 'regular' | 'moderator' | 'admin';
  reputation: number;
  notification_preferences: Record<string, boolean>;
  created_at?: string;
}

/** Modelo de Voto - mapea con la tabla `votes` */
export interface Vote {
  id: string;
  user_id: string;
  reply_id: string;
  value: 1 | -1;
  weight: number;
}

/** Tipos permitidos de notificación */
export type NotificationType = 'reply' | 'vote' | 'warning' | 'report' | 'mention';

/** Modelo de Notificación - mapea con la tabla `notifications` */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  reference_id: string;
  is_read: boolean;
  created_at: string;
}

/** Respuesta del endpoint de reputación */
export interface ReputationResponse {
  success: boolean;
  postsScore: number;
  repliesScore: number;
  globalReputation: number;
}

/** Payload para crear un voto */
export interface VotePayload {
  replyId: string;
  value: 1 | -1;
}

/** Payload para marcar notificaciones como leídas */
export interface MarkReadPayload {
  notificationIds?: string[];
}
