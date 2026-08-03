/**
 * Barril cliente del submódulo Profiles.
 *
 * `exports.ts` arrastra los servicios de Supabase, que dependen de
 * `next/headers` y solo existen en el servidor. Cualquier archivo marcado con
 * 'use client' (incluidos `error.tsx` y los componentes de otros módulos) debe
 * importar desde aquí, no desde `exports.ts`.
 *
 * Regla para mantenerlo: solo se añade a este barril lo que no toque
 * `@/lib/db/server` ni `@/lib/storage/server`.
 */

// --- Componentes ---
export { UserAvatar, type AvatarSize } from './components/UserAvatar'
export { ReputationBadge } from './components/ReputationBadge'
export { ProfileSkeleton } from './components/ProfileSkeleton'
export { ProfileErrorState } from './components/ProfileErrorState'

// --- Utilidades de avatar ---
export { DEFAULT_AVATAR_URL, resolveAvatarUrl } from './utils/avatar'

// --- Reputación e insignias (cálculo puro) ---
export {
  getBadgeForReputation,
  getNextBadge,
  getProgressToNextBadge,
  buildUserReputation,
  getAllBadges,
} from './services/badge-service'

// --- Server Actions (Next.js las convierte en referencias en el cliente) ---
export {
  updateProfileAction,
  updateAvatarAction,
  deleteAvatarAction,
} from './actions/profile.actions'

// --- Tipos ---
export type { User, UserRole } from '@/lib/types'

export type {
  PublicProfile,
  ProfileUpdate,
  UserReputation,
  ReputationLevel,
  ReputationBadgeInfo,
  ProfileFormState,
  ProfileField,
} from './types'
