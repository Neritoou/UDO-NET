/**
 * Barril cliente del submódulo Auth.
 *
 * `exports.ts` arrastra los servicios de Supabase, que dependen de
 * `next/headers`. Cualquier archivo marcado con 'use client' debe importar
 * desde aquí.
 *
 * Regla para mantenerlo: solo se añade a este barril lo que no toque
 * `@/lib/db/server`.
 */

// --- Componentes ---
export { LogoutButton } from './components/LogoutButton'
export { AuthSkeleton } from './components/AuthSkeleton'

// --- Server Actions (Next.js las convierte en referencias en el cliente) ---
export {
  loginAction,
  registerAction,
  logoutAction,
  requestPasswordResetAction,
  updatePasswordAction,
} from './actions/auth.actions'

// --- Roles (constantes y funciones puras) ---
export {
  USER_ROLES,
  DEFAULT_USER_ROLE,
  ROLE_LABELS,
  isValidRole,
  canModerate,
  isAdmin,
} from './utils/user-role'

// --- Tipos ---
export type { User, UserRole } from '@/lib/types'
export type { AuthFormState, AuthField } from './types'
