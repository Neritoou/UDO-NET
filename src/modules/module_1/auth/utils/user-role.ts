import type { UserRole } from '@/lib/types'

/** Roles válidos según la restricción CHECK de la tabla `users`. */
export const USER_ROLES: readonly UserRole[] = ['regular', 'moderator', 'admin']

/** Rol asignado a todo usuario recién registrado. */
export const DEFAULT_USER_ROLE: UserRole = 'regular'

/** Etiquetas en español para mostrar el rol en la interfaz. */
export const ROLE_LABELS: Record<UserRole, string> = {
  regular: 'Estudiante',
  moderator: 'Moderador',
  admin: 'Administrador',
}

/** Verifica que un valor desconocido corresponda a un rol válido. */
export function isValidRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole)
}

/** Indica si el rol permite ejecutar acciones de moderación. */
export function canModerate(role: UserRole): boolean {
  return role === 'moderator' || role === 'admin'
}

/** Indica si el rol tiene privilegios de administrador. */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}
