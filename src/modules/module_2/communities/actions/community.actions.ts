'use server'

import { getCurrentUser } from '@module_1/auth/exports'
import { getUserReputation } from '@module_1/profiles/exports'
import { revalidatePath } from 'next/cache'
import type { Community, UserRole } from '@/lib/types'
import { generateSlug } from '@/lib/utils/generateSlug'
import { IMAGE_PRESETS, uploadImage, replaceImage, deleteImage, deleteFolder } from '@/lib/storage/server'
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

import {
  MIN_REPUTATION_TO_CREATE,
  MAX_MAIN_COMMUNITIES,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '@/lib/constants/communities'

/** Tipo genérico para respuestas de Server Actions. */
export type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }

/** Invalida las rutas de caché relacionadas con una comunidad. */
async function revalidateCommunityPath(community: Community): Promise<void> {
  if (community.parent_id === null) {
    revalidatePath('/communities')
    revalidatePath(`/communities/${community.slug}`)
  } else {
    const parent = await getCommunityById(community.parent_id)
    if (parent) {
      revalidatePath(`/communities/${parent.slug}`)
      revalidatePath(`/communities/${parent.slug}/${community.slug}`)
    }
  }
}


/** Verifica si el usuario puede gestionar una comunidad (creador, moderador o admin). */
function canManageCommunity(community: Community, userId: string, role: UserRole): boolean {
  return community.created_by === userId || role === 'moderator' || role === 'admin'
}

// --- SUBCOMUNIDADES ---

export async function createSubcommunityAction(name: string, description: string, parentId: string): Promise<ActionResult<Community>> {
  const user = await getCurrentUser()
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

  if (user.reputation < MIN_REPUTATION_TO_CREATE) {
    return { error: `Necesitas al menos ${MIN_REPUTATION_TO_CREATE} de reputación para crear una subcomunidad.` }
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

export async function updateSubcommunityAction(communityId: string, name: string, description: string): Promise<ActionResult<Community>> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para editar una subcomunidad.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La subcomunidad no fue encontrada.' }
  /*if (community.parent_id === null) {
    return { error: 'No se pueden editar las comunidades principales.' }
  }*/

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

export async function deleteSubcommunityAction(communityId: string): Promise<ActionResult<true>> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión para eliminar una subcomunidad.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La subcomunidad no fue encontrada.' }
  if (community.parent_id === null) {
    return { error: 'No se pueden eliminar las comunidades principales.' }
  }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para eliminar esta subcomunidad.' }
  }

  // Limpiar toda la carpeta de la subcomunidad en el bucket
  await deleteFolder(`communities/${communityId}`)

  const deleted = await deleteSubcommunity(communityId)
  if (!deleted) return { error: 'No se pudo eliminar la subcomunidad. Intenta de nuevo.' }
  return { data: true }
}

// --- MEMBRESÍAS ---

export async function joinCommunityAction(communityId: string): Promise<ActionResult<true>> {
  const user = await getCurrentUser()
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

export async function leaveCommunityAction(communityId: string): Promise<ActionResult<true>> {
  const user = await getCurrentUser()
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
export async function uploadCommunityIconAction(communityId: string, base64: string): Promise<ActionResult<string>> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para cambiar el icono.' }
  }

  const parts = base64.split(',')
  if (parts.length < 2 || !parts[1]) return { error: 'Formato de imagen inválido.' }

  const buffer = Buffer.from(parts[1], 'base64')

  if (buffer.length > IMAGE_PRESETS.communityIcon.maxSize) {
    const maxKB = IMAGE_PRESETS.communityIcon.maxSize / 1024
    return { error: `La imagen supera el tamaño máximo de ${maxKB} KB.` }
  }

  const upload = community.icon_url ? replaceImage : uploadImage
  const result = await upload('communityIcon', communityId, buffer)
  if ('error' in result) return { error: result.error }

  const versionedUrl = `${result.url}?v=${Date.now()}`
  const updated = await updateCommunityIcon(communityId, versionedUrl)
  if (!updated) return { error: 'No se pudo actualizar el icono.' }

  await revalidateCommunityPath(community)
  return { data: versionedUrl }
}

/** Elimina el icono de una comunidad. */
export async function deleteCommunityIconAction(communityId: string): Promise<ActionResult<true>> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para eliminar el icono.' }
  }

  await deleteImage('communityIcon', communityId)
  await updateCommunityIcon(communityId, null)

  await revalidateCommunityPath(community)
  return { data: true }
}

/** Sube o reemplaza el banner de una comunidad. */
export async function uploadCommunityBannerAction(communityId: string, base64: string): Promise<ActionResult<string>> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para cambiar el banner.' }
  }

  const parts = base64.split(',')
  if (parts.length < 2 || !parts[1]) return { error: 'Formato de imagen inválido.' }

  const buffer = Buffer.from(parts[1], 'base64')

  if (buffer.length > IMAGE_PRESETS.communityBanner.maxSize) {
    const maxKB = IMAGE_PRESETS.communityBanner.maxSize / 1024
    return { error: `La imagen supera el tamaño máximo de ${maxKB} KB.` }
  }

  const upload = community.banner_url ? replaceImage : uploadImage
  const result = await upload('communityBanner', communityId, buffer)
  if ('error' in result) return { error: result.error }

  const versionedUrl = `${result.url}?v=${Date.now()}`
  const updated = await updateCommunityBanner(communityId, versionedUrl)
  if (!updated) return { error: 'No se pudo actualizar el banner.' }

  await revalidateCommunityPath(community)
  return { data: versionedUrl }
}

/** Elimina el banner de una comunidad. */
export async function deleteCommunityBannerAction(communityId: string): Promise<ActionResult<true>> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const community = await getCommunityById(communityId)
  if (!community) return { error: 'La comunidad no fue encontrada.' }

  if (!canManageCommunity(community, user.id, user.role)) {
    return { error: 'No tienes permisos para eliminar el banner.' }
  }

  await deleteImage('communityBanner', communityId)
  await updateCommunityBanner(communityId, null)

  await revalidateCommunityPath(community)
  return { data: true }
}