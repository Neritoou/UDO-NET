'use client';

import React, { useState, useCallback, useTransition, useRef } from 'react';
import type { Notification } from '@/lib/types/notification';
import NotificationItem from './NotificationItem';
import { markNotificationsAsRead } from '@/modules/module_4/notifications/actions/notifications.actions';

/**
 * Props del componente NotificationDropdown.
 *
 * Las notificaciones se obtienen en el servidor y se pasan como props iniciales,
 * siguiendo el patrón de Server Components. Esto elimina la necesidad de hacer
 * fetching desde el cliente al montar el componente y elimina la dependencia
 * de rutas de API que fueron removidas.
 */
interface NotificationDropdownProps {
  initialNotifications: Notification[];
}

/**
 * Componente NotificationDropdown
 *
 * Renderiza un ícono de campana en el encabezado con un badge de conteo de no leídas.
 * Al hacer clic, abre un popover que lista las notificaciones del usuario.
 *
 * Arquitectura: recibe las notificaciones pre-cargadas como prop `initialNotifications`
 * desde un componente padre de tipo Server Component. Las interacciones del usuario
 * (marcar como leída) se manejan mediante una Server Action dedicada, con actualizaciones
 * optimistas del estado local para garantizar una respuesta inmediata en la UI.
 */
export default function NotificationDropdown({ initialNotifications }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /**
   * Actualiza el estado local de forma optimista para marcar notificaciones como leídas,
   * luego llama a la Server Action para persistir el cambio en la base de datos.
   *
   * @param notificationIds - Arreglo de IDs a marcar. Si está vacío o ausente, marca todas las no leídas.
   */
  const markAsRead = useCallback(
    (notificationIds?: string[]) => {
      // Se aplica la actualización optimista de inmediato para que la UI se sienta instantánea.
      setNotifications((prev) =>
        prev.map((n) => {
          if (!notificationIds || notificationIds.length === 0) {
            return { ...n, is_read: true };
          }
          if (notificationIds.includes(n.id)) {
            return { ...n, is_read: true };
          }
          return n;
        })
      );

      // Se persiste el cambio de forma asíncrona mediante la Server Action.
      startTransition(async () => {
        await markNotificationsAsRead(notificationIds);
      });
    },
    []
  );

  /**
   * Maneja el clic sobre un ítem individual de notificación para marcarlo como leído.
   */
  const handleMarkSingleRead = useCallback(
    (notificationId: string) => {
      markAsRead([notificationId]);
    },
    [markAsRead]
  );

  /**
   * Alterna la apertura y cierre del dropdown.
   * Al abrir, marca todas las notificaciones no leídas actuales como leídas.
   */
  const toggleDropdown = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && unreadCount > 0) {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      markAsRead(unreadIds);
    }
  }, [isOpen, unreadCount, notifications, markAsRead]);

  // Cierra el dropdown cuando se detecta un clic fuera del área del componente.
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Botón de campana con badge de notificaciones no leídas */}
      <button
        onClick={toggleDropdown}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-gray-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
      >
        {/* Ícono SVG de campana */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 004.496 0 25.057 25.057 0 01-4.496 0z"
            clipRule="evenodd"
          />
        </svg>

        {/* Badge de conteo de no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-[fadeIn_0.2s_ease-out] rounded-3xl bg-white p-4 shadow-lg ring-1 ring-gray-100">
          {/* Encabezado del dropdown */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-800"
                disabled={isPending}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <span className="text-3xl">🔔</span>
                <p className="mt-2 text-sm text-gray-500">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkSingleRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
