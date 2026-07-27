'use client';

import React from 'react';
import type { Notification } from '@/modules/module_4/types';
import { formatDate } from '@/lib/utils/formatDate';
/**
 * Props del componente NotificationItem.
 */
interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (notificationId: string) => void;
}

/**
 * Mapa de tipos de notificación a etiquetas legibles y estilos.
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
export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const config = typeConfig[notification.type] || {
    label: notification.type,
    icon: '🔔',
  };

  return (
    <button
      onClick={() => {
        if (!notification.is_read) {
          onMarkRead(notification.id);
        }
      }}
      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 hover:bg-blue-100
        ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
    >
      {/* Indicador de no leída + Icono */}
      <div className="relative flex-shrink-0 pt-0.5">
        <span className="text-lg">{config.icon}</span>
        {!notification.is_read && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-bold text-gray-900">{config.label}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          ID: {notification.reference_id?.slice(0, 8)}...
        </p>
      </div>

      {/* Timestamp */}
      <span className="flex-shrink-0 text-xs text-gray-400">
       {formatDate(notification.created_at)}
      </span>
    </button>
  );
}
