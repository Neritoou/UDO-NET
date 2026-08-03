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

// --- Recuperación de contraseña ---
// `verifyRecoveryToken` la consume el Route Handler que atiende el enlace del
// correo: es la única parte de Next.js que puede escribir la cookie de sesión.
export { verifyRecoveryToken } from './services/auth-service'

// --- Server Actions ---
export {
  loginAction,
  registerAction,
  logoutAction,
  requestPasswordResetAction,
  updatePasswordAction,
} from './actions/auth.actions'

// --- Componentes ---
export { LoginView } from './components/LoginView'
export { RegisterView } from './components/RegisterView'
export { ForgotPasswordView } from './components/ForgotPasswordView'
export { UpdatePasswordView } from './components/UpdatePasswordView'
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
export type { AuthFormState, AuthField } from './types'
