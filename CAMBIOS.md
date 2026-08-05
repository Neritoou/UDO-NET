
# Notas de la Versión

## feat: correccion del modulo 4, corrección de RLS de enlaces y rediseño de interfaz

### 🛡️ Moderación (Módulo 5)
- Se integró la funcionalidad de **borrado lógico (soft-delete)** para publicaciones desde moderación tras ajustar las políticas de **RLS (Seguridad a Nivel de Filas)**.

### 🔔 Notificaciones (Módulo 4)
- Se activó el sistema de notificaciones.
- Se corrigió el error `404` en la pestaña dedicada a notificaciones.
- Los elementos ahora redirigen correctamente a su fuente correspondiente.

### 🔗 Vista Previa de Enlaces
- Se resolvió el problema de visualización previa en publicaciones al reactivar la API de la tabla de enlaces.
- Se corrigieron los permisos de RLS para los enlaces.

### 🔍 Búsqueda
- Se eliminó el filtro de ordenamiento **"Más Votados"** debido a la falta de seguimiento de votos en el backend.

### 📰 Feed
- Se actualizó el diseño de la interfaz y componentes para alinearlos con los bocetos de diseño (mockups).

### 👤 Perfil de Usuario
- **Posicionamiento del Avatar:** Se corrigió la capa/profundidad del avatar para evitar que se renderice detrás del banner.
- **Actualización Rápida de Archivos:** Se habilitó la actualización rápida de avatar y banner al hacer clic directamente en sus imágenes.
- **Optimización de Diseño:** Se eliminó la biografía duplicada de la tarjeta de información y se ocupó el espacio restante con la lista de publicaciones recientes del usuario.