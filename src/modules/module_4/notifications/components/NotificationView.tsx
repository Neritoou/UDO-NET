'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/lib/types/notification'
import { markNotificationsAsRead } from '@module_4/notifications/exports.client'

const FILTER_LABELS: Record<string, string> = {
  all: 'Todas',
  reply: 'Respuestas',
  vote: 'Votos',
  mention: 'Menciones',
  warning: 'Alertas',
  report: 'Reportes',
}

const TYPE_ICONS: Record<string, string> = {
  reply: '💬',
  vote: '⬆️',
  mention: '📣',
  warning: '⚠️',
  report: '🚩',
}

const TYPE_LABELS: Record<string, string> = {
  reply: 'Nueva respuesta',
  vote: 'Nuevo voto',
  mention: 'Te mencionaron',
  warning: 'Advertencia',
  report: 'Reporte',
}

export default function NotificationView({
  initialNotifications,
}: {
  initialNotifications: Notification[]
}) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredNotifications = selectedFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === selectedFilter)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function handleMarkOneAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    await markNotificationsAsRead([id])
  }

  async function handleMarkAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await markNotificationsAsRead(unreadIds)
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-main-black">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-regular-blue hover:underline"
          >
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(FILTER_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSelectedFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedFilter === value
                ? 'bg-main-black text-pure-white'
                : 'bg-lite-white text-gray-custom hover:bg-white-gray'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white-gray p-8 text-center text-sm text-gray-custom">
          {selectedFilter === 'all'
            ? 'No tienes notificaciones.'
            : `No hay notificaciones de tipo "${FILTER_LABELS[selectedFilter]}".`}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.is_read) handleMarkOneAsRead(notification.id);
                const targetId = notification.target_post_id || notification.reference_id;
                if (targetId) router.push(`/?thread=${targetId}`);
              }}
              className={`flex items-start gap-3 rounded-2xl px-4 py-3 transition cursor-pointer ${
                notification.is_read
                  ? 'bg-pure-white hover:bg-gray-50'
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <span className="text-lg shrink-0">
                {TYPE_ICONS[notification.type] ?? '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-main-black">
                  {TYPE_LABELS[notification.type] ?? notification.type}
                </p>
                <p className="text-xs text-gray-custom mt-0.5">
                  {new Date(notification.created_at).toLocaleDateString('es-VE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {!notification.is_read && (
                <span className="h-2.5 w-2.5 rounded-full bg-main-orange shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}