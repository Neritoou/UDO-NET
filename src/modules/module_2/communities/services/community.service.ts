import { createClient } from '@/lib/db/server'
import type { Community, User } from '@/lib/types'

// --- LECTURA DE COMUNIDADES ---

/** Obtiene una comunidad por su ID. */
export async function getCommunityById(communityId: string): Promise<Community | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .single()

  if (error) return null
  return data
}

/** Obtiene una comunidad principal por su slug. */
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .is('parent_id', null)
    .single()

  if (error) return null
  return data
}

/** Obtiene todas las comunidades principales ordenadas por nombre. */
export async function getAllCommunities(): Promise<Community[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .is('parent_id', null)
    .order('name')

  if (error) return []
  return data
}

// --- LECTURA DE SUBCOMUNIDADES ---

/** Obtiene todas las subcomunidades de una comunidad padre. */
export async function getSubcommunities(communityId: string): Promise<Community[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('parent_id', communityId)
    .order('name')

  if (error) return []
  return data
}

/** Busca una subcomunidad por su slug dentro de una comunidad padre específica. */
export async function getSubcommunityBySlug(slug: string, parentId: string): Promise<Community | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .eq('parent_id', parentId)
    .single()

  if (error) return null
  return data
}

// --- MEMBRESÍAS ---

/** Verifica si un usuario está suscrito a una comunidad o subcomunidad. */
export async function isUserSubscribed(userId: string, communityId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_communities')
    .select('user_id')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .single()

  if (error) return false
  return !!data
}

/** Obtiene la cantidad de miembros de una comunidad o subcomunidad. */
export async function getCommunityMemberCount(communityId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('user_communities')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', communityId)

  if (error) return 0
  return count ?? 0
}

/** Obtiene los usuarios suscritos a una comunidad o subcomunidad. */
export async function getCommunityMembers(communityId: string): Promise<User[]> {
  const supabase = await createClient()

  const { data: memberships, error: memberError } = await supabase
    .from('user_communities')
    .select('user_id')
    .eq('community_id', communityId)

  if (memberError || !memberships?.length) return []

  const userIds = memberships.map((m: { user_id: string }) => m.user_id)

  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, role, reputation, bio')
    .in('id', userIds)
    .order('username')

  if (error) return []
  return data as User[]
}

/** Obtiene las comunidades principales a las que un usuario está suscrito. */
export async function getUserMainCommunities(userId: string): Promise<Community[]> {
  const supabase = await createClient()

  const { data: memberships, error: memberError } = await supabase
    .from('user_communities')
    .select('community_id')
    .eq('user_id', userId)

  if (memberError || !memberships?.length) return []

  const communityIds = memberships.map((m: { community_id: string }) => m.community_id)

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .in('id', communityIds)
    .is('parent_id', null)
    .order('name')

  if (error) return []
  return data
}

/** Obtiene las subcomunidades de una comunidad padre a las que un usuario está suscrito. */
export async function getUserSubcommunities(userId: string, parentId: string): Promise<Community[]> {
  const supabase = await createClient()

  const { data: memberships, error: memberError } = await supabase
    .from('user_communities')
    .select('community_id')
    .eq('user_id', userId)

  if (memberError || !memberships?.length) return []

  const communityIds = memberships.map((m: { community_id: string }) => m.community_id)

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .in('id', communityIds)
    .eq('parent_id', parentId)
    .order('name')

  if (error) return []
  return data
}

// --- ESCRITURA ---

/** Inserta una nueva subcomunidad en la tabla communities. */
export async function createSubcommunity(subcommunity: {
  name: string
  slug: string
  description: string
  parent_id: string
  created_by: string
}): Promise<Community | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .insert(subcommunity)
    .select()
    .single()

  if (error) return null
  return data
}

/** Actualiza el nombre y/o descripción de una subcomunidad. */
export async function updateSubcommunity(communityId: string, fields: { name?: string; slug?: string; description?: string }
): Promise<Community | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .update(fields)
    .eq('id', communityId)
    //.not('parent_id', 'is', null)
    .select()
    .single()

  if (error) return null
  return data
}

/** Suscribe a un usuario a una comunidad o subcomunidad. */
export async function joinCommunity(userId: string, communityId: string ): Promise<{ success: boolean; alreadySubscribed: boolean }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_communities')
    .insert({ user_id: userId, community_id: communityId })

  if (!error) return { success: true, alreadySubscribed: false }
  // 23505 = violación de unique constraint
  if (error.code === '23505') return { success: false, alreadySubscribed: true }
  return { success: false, alreadySubscribed: false }
}

/** Desuscribe a un usuario de una comunidad o subcomunidad. */
export async function leaveCommunity(userId: string, communityId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_communities')
    .delete()
    .eq('user_id', userId)
    .eq('community_id', communityId)

  if (error) return false
  return true
}

/** Desuscribe a un usuario de todas las subcomunidades de una comunidad padre. */
export async function leaveAllSubcommunities(userId: string, parentId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: subcommunities, error: fetchError } = await supabase
    .from('communities')
    .select('id')
    .eq('parent_id', parentId)

  if (fetchError || !subcommunities?.length) return true

  const subcommunityIds = subcommunities.map((s: { id: string }) => s.id)

  const { error } = await supabase
    .from('user_communities')
    .delete()
    .eq('user_id', userId)
    .in('community_id', subcommunityIds)

  if (error) return false
  return true
}

/** Remueve el creador de una subcomunidad (establece created_by como null). */
export async function removeSubcommunityCreator(communityId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('communities')
    .update({ created_by: null })
    .eq('id', communityId)
    .not('parent_id', 'is', null)

  if (error) return false
  return true
}

/** Elimina una subcomunidad por su ID. */
export async function deleteSubcommunity(communityId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('communities')
    .delete()
    .eq('id', communityId)
    .not('parent_id', 'is', null)

  if (error) return false
  return true
}

/** Actualiza el icon_url de una comunidad. */
export async function updateCommunityIcon(communityId: string, iconUrl: string | null): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('communities')
    .update({ icon_url: iconUrl })
    .eq('id', communityId)

  if (error) return false
  return true
}

/** Actualiza el banner_url de una comunidad. */
export async function updateCommunityBanner(communityId: string, bannerUrl: string | null): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('communities')
    .update({ banner_url: bannerUrl })
    .eq('id', communityId)

  if (error) return false
  return true
}