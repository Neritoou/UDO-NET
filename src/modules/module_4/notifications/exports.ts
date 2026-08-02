// Expone el servicio de creación de notificaciones para uso de otros módulos (ej. Módulo 3 y Módulo 5).
export { createNotification } from './services/notification.service';

// Expone la Server Action de marcar como leídas para uso de los componentes consumidores.
export { markNotificationsAsRead } from './actions/notifications.actions';