import { redirect } from 'next/navigation';
import { getCurrentUser } from '@module_1/auth/exports';
import { getUserNotifications } from '@module_4/notifications/exports';
import Link from 'next/link';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const notifications = await getUserNotifications(user.id, 50);

  const getNotificationHref = (notification: { type: string; reference_id: string | null; target_post_id?: string | null }) => {
    const targetPostId = notification.target_post_id || notification.reference_id;

    switch (notification.type) {
      case 'reply':
      case 'vote':
      case 'mention':
        return targetPostId ? `/?thread=${targetPostId}` : '#';
      case 'warning':
      case 'report':
        return `/moderation`;
      default:
        return targetPostId ? `/?thread=${targetPostId}` : '#';
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="text-xl font-bold text-main-black mb-6">Notificaciones</h1>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No tienes notificaciones.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const href = getNotificationHref(notification);

            return (
              <Link
                key={notification.id}
                href={href}
                className={`flex items-start justify-between gap-3 rounded-2xl px-4 py-3 transition hover:bg-gray-50 ${
                  notification.is_read ? 'bg-white border border-gray-100' : 'bg-blue-50 border border-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">
                    {notification.type === 'reply' && '💬'}
                    {notification.type === 'vote' && '⬆️'}
                    {notification.type === 'mention' && '📣'}
                    {notification.type === 'warning' && '⚠️'}
                    {notification.type === 'report' && '🚩'}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {notification.type === 'reply' && 'Nueva respuesta'}
                      {notification.type === 'vote' && 'Nuevo voto'}
                      {notification.type === 'mention' && 'Te mencionaron'}
                      {notification.type === 'warning' && 'Advertencia'}
                      {notification.type === 'report' && 'Reporte'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(notification.created_at).toLocaleString('es-VE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {!notification.is_read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}