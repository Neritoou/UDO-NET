'use client';

import React from 'react';
import type { Notification } from '@/lib/types/notification';
import { formatDate } from '@/lib/utils/formatDate';
/**
 * Props del componente NotificationItem.
 */
interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (notificationId: string) => void;
  onNavigate?: (targetPostId: string) => void;
}

/**
 * Mapa de tipos de notificación a etiquetas legibles y configuración de ícono.
 */
const typeConfig: Record<string, { label: string; icon: string }> = {
  reply: { label: 'Nueva Respuesta', icon: '💬' },
  vote: { label: 'Nuevo Voto', icon: '⬆️' },
  mention: { label: 'Te mencionaron', icon: '📣' },
  warning: { label: 'Advertencia', icon: '⚠️' },
  report: { label: 'Reporte', icon: '🚩' },
};

/**
 * Componente NotificationItem
 *
 * Renderiza individualmente cada notificación con estilos condicionales
 * según su estado de lectura (is_read).
 */
export default function NotificationItem({ notification, onMarkRead, onNavigate }: NotificationItemProps) {
  const config = typeConfig[notification.type] || {
    label: notification.type,
    icon: '🔔',
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    const targetId = notification.target_post_id || notification.reference_id;
    if (targetId && onNavigate) {
      onNavigate(targetId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 hover:bg-blue-100 cursor-pointer
        ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
    >
      {/* Indicador de no leída + ícono del tipo */}
      <div className="relative flex-shrink-0 pt-0.5">
        <span className="text-lg">{config.icon}</span>
        {!notification.is_read && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
        )}
      </div>

      {/* Contenido de texto de la notificación */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-bold text-gray-900">{config.label}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {notification.type === 'reply' && 'Alguien ha respondido a tu publicación.'}
          {notification.type === 'vote' && 'Has recibido una nueva valoración en tu respuesta.'}
          {notification.type === 'mention' && 'Has sido mencionado en una conversación.'}
          {notification.type === 'warning' && 'Has recibido una advertencia del equipo de moderación.'}
          {notification.type === 'report' && 'Nueva actualización en el centro de reportes.'}
          {!['reply', 'vote', 'mention', 'warning', 'report'].includes(notification.type) &&
            `Ref: ${notification.reference_id?.slice(0, 8) || 'Detalle'}`}
        </p>
      </div>

      {/* Fecha y hora de la notificación */}
      <span className="flex-shrink-0 text-xs text-gray-400">
       {formatDate(notification.created_at)}
      </span>
    </button>
  );
}
