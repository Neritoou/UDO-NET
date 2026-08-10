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
      return 1.0; // Peso por defecto en caso de error
    }

    if (!user) {
      return 1.0;
    }

    // Moderadores, administradores o usuarios con alta reputación obtienen peso doble (2.0)
    if (user.role === 'moderator' || user.role === 'admin' || (user.reputation && user.reputation > 1000)) {
      return 2.0;
    }

    return 1.0;
  } catch {
    return 1.0;
  }
}