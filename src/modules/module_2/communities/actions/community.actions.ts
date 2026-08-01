'use server'

// Reemplazar mocks con imports reales cuando el Módulo 1 esté listo
// import { getCurrentUser } from '@module_1/auth/exports'
// import { getUserReputation } from '@module_1/profiles/exports'

import type { Community, UserRole } from '@/lib/types'
import { generateSlug } from '@/lib/utils/generateSlug'
import { uploadImage, deleteImage } from '@/lib/storage/server'
import {
  createSubcommunity,
  deleteSubcommunity,
  getCommunityById,
  getSubcommunityBySlug,
  getUserMainCommunities,
  isUserSubscribed,
  joinCommunity,
  leaveCommunity,
  leaveAllSubcommunities,
  removeSubcommunityCreator,
  updateSubcommunity,
  updateCommunityIcon,
  updateCommunityBanner,
} from '../services/community.service'

const MIN_REPUTATION = 100
const MAX_NAME_LENGTH = 50
const MAX_DESCRIPTION_LENGTH = 500
const MAX_MAIN_COMMUNITIES = 3

// (!) --- Usuario mock ---
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@test.com',
  username: 'testuser',
  avatar_url: null,
  bio: null,
  is_public: true,
  role: 'regular' as UserRole,
  reputation: 150,
  created_at: new Date().toISOString(),
}

/** Verifica si el usuario puede gestionar una comunidad (creador, moderador o admin). */
function canManageCommunity(community: Community, userId: string, role: UserRole): boolean {
  return community.created_by === userId || role === 'moderator' || role === 'admin'
}

// --- SUBCOMUNIDADES ---

/**
 * Crea una nueva subcomunidad dentro de una comunidad padre.
 *
 * Validaciones:
 * - El usuario debe estar autenticado.
 * - El nombre no debe estar vacío y no puede superar los 50 caracteres.
 * - La descripción no debe estar vacía y no puede superar los 500 caracteres.
 * - La comunidad padre debe existir y no puede ser una subcomunidad.
 * - El usuario debe pertenecer a la comunidad padre.
 * - El usuario debe tener al menos 100 de reputación.
 * - No puede existir otra subcomunidad con el mismo slug en el mismo padre.
 */
export async function createSubcommunityAction(name: string,description: string, parentId: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión para crear una subcomunidad.' }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'El nombre de la subcomunidad es obligatorio.' }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { error: `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.` }
  }

  const trimmedDescription = description.trim()
  if (!trimmedDescription) return { error: 'La descripción de la subcomunidad es obligatoria.' }
  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.` }
  }

  const parentCommunity = await getCommunityById(parentId)
  if (!parentCommunity) return { error: 'La comunidad padre no fue encontrada.' }
  if (parentCommunity.parent_id !== null) {
    return { error: 'No se puede crear una subcomunidad dentro de otra subcomunidad.' }
  }

  const belongsToParent = await isUserSubscribed(user.id, parentId)
  if (!belongsToParent) {
    return { error: 'Debes pertenecer a esta comunidad para crear una subcomunidad.' }
  }

  // Reemplazar con reputación real cuando el Módulo 1 esté listo
  const reputation = user.reputation
  if (reputation < MIN_REPUTATION) {
    return { error: `Necesitas al menos ${MIN_REPUTATION} de reputación para crear una subcomunidad.` }
  }

  const slug = generateSlug(trimmedName)
  if (!slug) return { error: 'El nombre de la subcomunidad no es válido.' }

  const existingSubcommunity = await getSubcommunityBySlug(slug, parentId)
  if (existingSubcommunity) {
    return { error: 'Ya existe una subcomunidad con este nombre en esta comunidad.' }
  }

  const subcommunity = await createSubcommunity({
    name: trimmedName,
    slug,
    description: trimmedDescription,
    parent_id: parentId,
    created_by: user.id,
  })

  if (!subcommunity) return { error: 'No se pudo crear la subcomunidad. Intenta de nuevo.' }

  await joinCommunity(user.id, subcommunity.id)

  return { data: subcommunity }
}

/**
 * Actualiza una subcomunidad.
 *
 * Validaciones:
 * - El usuario debe estar autenticado.
 * - La comunidad debe existir y ser una subcomunidad.
 * - Solo el creador, un moderador o un admin pueden editarla.
 * - Nombre y descripción deben cumplir las reglas de longitud.
 * - Si el nombre cambia, el slug no puede duplicarse dentro del mismo padre.
 */
export async function updateSubcommunityAction(communityId: string,name: string, description: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión para editar una subcomunidad.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La subcomunidad no fue encontrada.' }
  if (community.parent_id === null) {
    return { error: 'No se pueden editar las comunidades principales.' }
  }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para editar esta subcomunidad.' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'El nombre de la subcomunidad es obligatorio.' }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { error: `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.` }
  }

  const trimmedDescription = description.trim()
  if (!trimmedDescription) return { error: 'La descripción de la subcomunidad es obligatoria.' }
  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.` }
  }

  const newSlug = generateSlug(trimmedName)
  if (!newSlug) return { error: 'El nombre de la subcomunidad no es válido.' }

  if (newSlug !== community.slug) {
    const existing = await getSubcommunityBySlug(newSlug, community.parent_id!)
    if (existing) {
      return { error: 'Ya existe una subcomunidad con este nombre en esta comunidad.' }
    }
  }

  const updated = await updateSubcommunity(communityId, {
    name: trimmedName,
    slug: newSlug,
    description: trimmedDescription,
  })

  if (!updated) return { error: 'No se pudo actualizar la subcomunidad. Intenta de nuevo.' }
  return { data: updated }
}

/**
 * Elimina una subcomunidad por su ID.
 *
 * Validaciones:
 * - El usuario debe estar autenticado.
 * - La comunidad debe existir y ser una subcomunidad.
 * - Solo el creador, un moderador o un admin pueden eliminarla.
 */
export async function deleteSubcommunityAction(communityId: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión para eliminar una subcomunidad.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La subcomunidad no fue encontrada.' }
  if (community.parent_id === null) {
    return { error: 'No se pueden eliminar las comunidades principales.' }
  }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para eliminar esta subcomunidad.' }
  }

  const deleted = await deleteSubcommunity(communityId)
  if (!deleted) return { error: 'No se pudo eliminar la subcomunidad. Intenta de nuevo.' }
  return { data: true }
}

// --- MEMBRESÍAS ---

/**
 * Suscribe al usuario a una comunidad o subcomunidad.
 *
 * Validaciones:
 * - El usuario debe estar autenticado.
 * - La comunidad debe existir.
 * - Para subcomunidades, el usuario debe pertenecer a la comunidad padre.
 * - Para comunidades principales, el máximo es 3.
 */
export async function joinCommunityAction(communityId: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión para unirte a una comunidad.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (community.parent_id !== null) {
    const belongsToParent = await isUserSubscribed(user.id, community.parent_id)
    if (!belongsToParent) {
      return { error: 'Debes pertenecer a la comunidad principal para unirte a esta subcomunidad.' }
    }
  }

  if (community.parent_id === null) {
    const mainCommunities = await getUserMainCommunities(user.id)
    if (mainCommunities.length >= MAX_MAIN_COMMUNITIES) {
      return { error: `No puedes pertenecer a más de ${MAX_MAIN_COMMUNITIES} carreras.` }
    }
  }

  const result = await joinCommunity(user.id, communityId)
  if (result.alreadySubscribed) return { error: 'Ya perteneces a esta comunidad.' }
  if (!result.success) return { error: 'No se pudo unir a la comunidad. Intenta de nuevo.' }
  return { data: true }
}

/**
 * Desuscribe al usuario de una comunidad o subcomunidad.
 *
 * Validaciones:
 * - El usuario debe estar autenticado.
 * - El usuario debe pertenecer a la comunidad.
 * - Si es comunidad principal, desuscribe de todas sus subcomunidades.
 * - Si es subcomunidad y el usuario es el creador, transfiere la propiedad a null.
 */
export async function leaveCommunityAction(communityId: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión para salir de una comunidad.' }

  const subscribed = await isUserSubscribed(user.id, communityId)
  if (!subscribed) return { error: 'No perteneces a esta comunidad.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (community.parent_id !== null && community.created_by === user.id) {
    await removeSubcommunityCreator(communityId)
  }

  if (community.parent_id === null) {
    await leaveAllSubcommunities(user.id, communityId)
  }

  const left = await leaveCommunity(user.id, communityId)
  if (!left) return { error: 'No se pudo salir de la comunidad. Intenta de nuevo.' }
  return { data: true }
}

// --- STORAGE ---

/** Sube o reemplaza el icono de una comunidad. */
export async function uploadCommunityIconAction(communityId: string, base64: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para cambiar el icono.' }
  }

  const buffer = Buffer.from(base64.split(',')[1], 'base64')
  const result = await uploadImage('communityIcon', communityId, buffer)
  if ('error' in result) return { error: result.error }

  const updated = await updateCommunityIcon(communityId, result.url)
  if (!updated) return { error: 'No se pudo actualizar el icono.' }

  return { data: result.url }
}

/** Elimina el icono de una comunidad. */
export async function deleteCommunityIconAction(communityId: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para eliminar el icono.' }
  }

  await deleteImage('communityIcon', communityId)
  await updateCommunityIcon(communityId, null)

  return { data: true }
}

/** Sube o reemplaza el banner de una comunidad. */
export async function uploadCommunityBannerAction(communityId: string, base64: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para cambiar el banner.' }
  }

  const buffer = Buffer.from(base64.split(',')[1], 'base64')
  const result = await uploadImage('communityBanner', communityId, buffer)
  if ('error' in result) return { error: result.error }

  const updated = await updateCommunityBanner(communityId, result.url)
  if (!updated) return { error: 'No se pudo actualizar el banner.' }

  return { data: result.url }
}

/** Elimina el banner de una comunidad. */
export async function deleteCommunityBannerAction(communityId: string) {
  const user = MOCK_USER
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para eliminar el banner.' }
  }

  await deleteImage('communityBanner', communityId)
  await updateCommunityBanner(communityId, null)

  return { data: true }
}