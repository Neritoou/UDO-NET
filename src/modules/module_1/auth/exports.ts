/**
 * Barril del submódulo Auth (Módulo 1).
 *
 * Es el único punto de entrada permitido para el resto de módulos.
 * Los componentes de vista (LoginView, RegisterView, etc.) y los skeletons
 * se importan directamente desde sus archivos por las pages de src/app/.
 */

// --- Sesión ---
export {
  getCurrentUser,
  getCurrentUserId,
  isAuthenticated,
  ensureUserProfile,
} from './services/session-service'

// --- Recuperación de contraseña ---
export { verifyRecoveryToken } from './services/auth-service'

// --- Server Actions ---
export {
  loginAction,
  registerAction,
  logoutAction,
  requestPasswordResetAction,
  updatePasswordAction,
} from './actions/auth.actions'

// --- Componentes reutilizables por otros módulos ---
export { LogoutButton } from './components/LogoutButton'

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