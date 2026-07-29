import { createClient } from '@/lib/db/server';

/**
 * Calcula el peso (weight) de un voto basándose en el rol y reputación del usuario.
 * @param userId - ID del usuario que emite el voto.
 * @returns El peso del voto: 2.0 o 1.0.
 */
export async function calculateWeight(userId: string): Promise<number> {
  try {
    // Inicializar la conexión a Supabase con la configuración del equipo
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('role, reputation')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al consultar usuario para calcular peso:', error.message);
      return 1.0; // Peso por defecto en caso de error
    }

    if (!user) {
      return 1.0;
    }

    // Moderadores o usuarios con alta reputación obtienen peso doble
    if (user.role === 'moderator' || user.reputation > 1000) {
      return 2.0;
    }

    return 1.0;
  } catch (error) {
    console.error('Error inesperado en calculateWeight:', error);
    return 1.0;
  }
}