/**
 * Barril del submódulo Profiles (Módulo 1).
 *
 * Es el único punto de entrada permitido para el resto de módulos.
 * Los componentes de vista (ProfileView, ProfileEditView, etc.) y los skeletons
 * se importan directamente desde sus archivos por las pages de src/app/.
 */

// --- Consultas de perfil ---
export {
  getUserProfile,
  getUserProfileByUsername,
  getUserRole,
  getUserReputation,
  isUsernameTaken,
  updateUserProfile,
} from './services/profile-service'

// --- Perfil visible para terceros ---
export { getPublicProfile, toPublicProfile } from './utils/public-profile'

// --- Insignias a partir de la reputación ---
export {
  getBadgeForReputation,
  getNextBadge,
  getProgressToNextBadge,
  buildUserReputation,
  getAllBadges,
} from './services/badge-service'

// --- Avatares ---
export { DEFAULT_AVATAR_URL, resolveAvatarUrl } from './utils/avatar'
export { cleanupUserImages } from './services/storage-service'

// --- Server Actions ---
export {
  updateProfileAction,
  updateAvatarAction,
  deleteAvatarAction,
} from './actions/profile.actions'

// --- Componentes reutilizables por otros módulos ---
export { ProfileCard } from './components/ProfileCard'
export { ReputationBadge } from './components/ReputationBadge'
export { UserAvatar, type AvatarSize } from './components/UserAvatar'

// --- Tipos ---
export type { User, UserRole } from '@/lib/types'

export type {
  PublicProfile,
  ProfileUpdate,
  ProfileInput,
  UserReputation,
  ReputationLevel,
  ReputationBadgeInfo,
  ProfileFormState,
  ProfileField,
} from './types'