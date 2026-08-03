/**
 * Barril cliente del submódulo Notifications (Módulo 4).
 *
 * El barrel principal exporta services que dependen de @/lib/db/server.
 * Archivos con 'use client' deben importar desde aquí.
 */

// --- Componentes ---
export { default as NotificationDropdown } from './components/NotificationDropdown'
export { default as NotificationItem } from './components/NotificationItem'

// --- Server Actions (Next.js las convierte en referencias en el cliente) ---
export { markNotificationsAsRead } from './actions/notifications.actions'