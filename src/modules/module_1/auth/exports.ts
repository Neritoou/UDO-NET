/**
 * Barril del submódulo Auth (Módulo 1).
 *
 * Es el único punto de entrada permitido para el resto de módulos.
 * No importen nada desde `services/`, `actions/` ni `components/` directamente.
 *
 * (!) Este barril incluye servicios que solo corren en el servidor. Desde un
 * archivo con 'use client' hay que importar de `./exports.client` en su lugar.
 */

// --- Sesión ---
export {
  getCurrentUser,
  getCurrentUserId,
  isAuthenticated,
  ensureUserProfile,
} from './services/session-service'

// --- Acceso con Google ---
// `completeGoogleSignIn` la consume el Route Handler que atiende el retorno
// desde Google: es la única parte de Next.js que puede escribir la cookie de
// sesión al canjear el código.
export { completeGoogleSignIn } from './services/session-service'

// --- Server Actions ---
export { loginWithGoogleAction, logoutAction } from './actions/auth.actions'

// --- Componentes ---
export { LoginView } from './components/LoginView'
export { LogoutButton } from './components/LogoutButton'
export { AuthSkeleton } from './components/AuthSkeleton'

// --- Roles ---
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
export type { AuthFormState } from './types'
