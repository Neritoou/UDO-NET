'use client';

import React from 'react';
import type { Notification } from '@/modules/module_4/types';

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
 * Formatea una fecha ISO a un formato relativo legible.
 */
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

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
        {formatRelativeTime(notification.created_at)}
      </span>
    </button>
  );
}
