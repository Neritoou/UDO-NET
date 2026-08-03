/**
 * Barril del submódulo Profiles (Módulo 1).
 *
 * Es el único punto de entrada permitido para el resto de módulos.
 * Ningún otro módulo debe consultar la tabla `users` por su cuenta: si necesitan
 * el nombre o la reputación del autor de un post, deben llamar a estas funciones.
 *
 * (!) Este barril incluye servicios que solo corren en el servidor. Desde un
 * archivo con 'use client' hay que importar de `./exports.client` en su lugar.
 */

// --- Consultas de perfil ---
export {
  getUserProfile,
  getUserProfileByUsername,
  getUserRole,
  getUserReputation,
  isUsernameTaken,
} from './services/profile-service'

// Escritura directa del perfil. Para cambios que vengan de un formulario es
// preferible `updateProfileAction`, que además valida y revalida la caché.
export { updateUserProfile } from './services/profile-service'

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

// --- Componentes ---
export { ProfileView } from './components/ProfileView'
export { ProfileEditView } from './components/ProfileEditView'
export { ProfileCard } from './components/ProfileCard'
export { ReputationBadge } from './components/ReputationBadge'
export { UserAvatar, type AvatarSize } from './components/UserAvatar'
export { ProfileSkeleton } from './components/ProfileSkeleton'
export { ProfileErrorState } from './components/ProfileErrorState'

// --- Tipos ---
// El perfil es el `User` de `@/lib/types`; se reexporta para que los demás
// módulos tengan un único punto de entrada, pero es el mismo tipo compartido.
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
