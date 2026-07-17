# Módulo 2: Community Service y Actions

## Qué se hizo

Implementación completa de la capa de services y actions para comunidades y subcomunidades.

### Service (community.service.ts)
Queries directas a Supabase organizadas en tres secciones:
- **Lectura:** obtener comunidades por ID, slug, listar carreras y subcomunidades
- **Membresías:** verificar suscripción, obtener comunidades/subcomunidades del usuario, contar miembros
- **Escritura:** crear, actualizar y eliminar subcomunidades, gestionar suscripciones, transferir propiedad

### Actions (community.actions.ts)
Server Actions con validación de negocio organizadas en tres secciones:
- **Subcomunidades:** crear (con auto-suscripción del creador), actualizar, eliminar
- **Membresías:** unirse (con límite de 3 carreras y validación de padre), salirse (con desuscripción en cascada y transferencia de propiedad)
- **Storage:** subir/eliminar icono y banner de comunidad

## Decisiones técnicas

- **Dos queries secuenciales** en `getUserMainCommunities` y `getUserSubcommunities` en vez de JOIN implícito de Supabase, por limitaciones de tipado con TypeScript
- **`joinCommunity`** retorna `{ success, alreadySubscribed }` para distinguir duplicados (PostgreSQL 23505) de otros errores
- **`canManageCommunity`** como helper booleano para centralizar la validación de permisos (creador/moderador/admin)
- **Al salir de una comunidad principal**, se desuscriben automáticamente todas las subcomunidades con `leaveAllSubcommunities`
- **Al salir de una subcomunidad siendo creador**, la propiedad se transfiere a null con `removeSubcommunityCreator`
- **Mock user** temporal con tipo `UserRole` (no `as const`) para evitar errores de comparación en TypeScript

## Exports (lo que otros módulos pueden usar)

Las funciones expuestas en `exports.ts` son solo de lectura:

- `getCommunityById` — obtener datos de una comunidad (Módulo 3, Módulo 5)
- `getCommunityBySlug` — resolver slug de URL a comunidad
- `getAllCommunities` — listar todas las carreras
- `getSubcommunities` — listar subcomunidades de una carrera
- `getUserMainCommunities` — carreras del usuario (perfil, sidebar)
- `getUserSubcommunities` — subcomunidades suscritas dentro de una carrera
- `isUserSubscribed` — verificar membresía antes de publicar/votar (Módulo 3, Módulo 4)
- `getCommunityMemberCount` — mostrar cantidad de miembros

Las funciones de escritura no se exponen — siempre pasan por las actions con sus validaciones.
## Dependencias con otros módulos

- **Módulo 1 (pendiente):** `getCurrentUser()` y `getUserReputation()` — actualmente usa mock
- **Storage (`lib/storage/`):** `uploadImage` y `deleteImage` para iconos y banners


## Cómo probar

1. Crear un usuario mock en la tabla `users` con el ID `00000000-0000-0000-0000-000000000001`
2. Las políticas RLS de `user_communities` y `communities` deben estar en `true` temporalmente (no hay auth real)
3. Las funciones de lectura se pueden probar desde un Server Component llamando al service directamente
4. Las actions se pueden probar desde un Client Component o desde una página de test temporal