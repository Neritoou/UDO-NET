import { createClient } from '@/lib/db/server';

/**
 * Obtiene la reputación actual de un usuario y determina su nivel o badge.
 */
export async function getUserReputation(userId: string) {
  try {
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('reputation')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error al obtener la reputación:', error?.message);
      return 0;
    }

    return user.reputation || 0;
  } catch (error) {
    console.error('Error inesperado en getUserReputation:', error);
    return 0;
  }
}