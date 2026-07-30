'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '@/modules/module_4/types';
import NotificationItem from './NotificationItem';

/**
 * Props del componente NotificationDropdown.
 */
interface NotificationDropdownProps {
  currentUserId: string;
}

/**
 * Componente NotificationDropdown
 *
 * Muestra un ícono de campana en el header con indicador naranja
 * para notificaciones no leídas. Al hacer clic, abre un popover
 * flotante con la lista de notificaciones.
 *
 * Comportamiento:
 * - Fetch de datos con useEffect al montar.
 * - Al abrir el dropdown, marca las no leídas como leídas vía PATCH.
 * - Al hacer clic en un ítem individual, lo marca como leído.
 */
export default function NotificationDropdown({ currentUserId }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /**
   * Obtiene las notificaciones del usuario desde la API.
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'x-user-id': currentUserId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  /**
   * Marca notificaciones como leídas.
   * Si se pasan IDs específicos, marca solo esas.
   * Si no se pasan IDs, marca todas las no leídas.
   */
  const markAsRead = useCallback(
    async (notificationIds?: string[]) => {
      try {
        const response = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUserId,
          },
          body: JSON.stringify({
            notificationIds: notificationIds || [],
          }),
        });

        if (response.ok) {
          // Actualizar estado local
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
        }
      } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
      }
    },
    [currentUserId]
  );

  /**
   * Maneja el clic en un ítem individual de notificación.
   */
  const handleMarkSingleRead = useCallback(
    (notificationId: string) => {
      markAsRead([notificationId]);
    },
    [markAsRead]
  );

  /**
   * Maneja la apertura/cierre del dropdown.
   * Al abrir, marca todas las no leídas como leídas.
   */
  const toggleDropdown = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && unreadCount > 0) {
      // Marcar todas como leídas al abrir el dropdown
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      markAsRead(unreadIds);
    }
  }, [isOpen, unreadCount, notifications, markAsRead]);

  // Fetch inicial de notificaciones
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
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
      {/* Botón de campana */}
      <button
        onClick={toggleDropdown}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-gray-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
      >
        {/* Ícono de campana (SVG) */}
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

        {/* Indicador de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-[fadeIn_0.2s_ease-out] rounded-3xl bg-white p-4 shadow-lg ring-1 ring-gray-100">
          {/* Header del dropdown */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-800"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
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
