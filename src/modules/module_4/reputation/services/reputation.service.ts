import { createClient } from '@/lib/db/server';

/**
 * Obtiene el puntaje de reputación actual de un usuario.
 *
 * Lee la columna `reputation` de la tabla `users`. Retorna 0 como valor seguro
 * por defecto si el usuario no existe o si ocurre un error de base de datos,
 * garantizando que los componentes de la UI siempre reciban un número válido.
 *
 * @param userId - UUID del usuario cuya reputación se desea consultar.
 * @returns El puntaje de reputación del usuario como número, o 0 en caso de error.
 */
export async function getUserReputation(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('reputation')
      .eq('id', userId)
      .single();

    if (error || !user) {
      // Se retorna 0 como valor de respaldo seguro para que la UI pueda mostrar un estado por defecto.
      return 0;
    }

    return user.reputation || 0;
  } catch {
    // Se retorna 0 ante errores inesperados para evitar que la interfaz de usuario falle.
    return 0;
  }
}

/**
 * Incrementa o decrementa los puntos de reputación de un usuario.
 *
 * Utiliza la función almacenada `increment_reputation` de PostgreSQL (SECURITY DEFINER)
 * para actualizar atomicamente tanto `public.users.reputation` como `public.reputation`.
 *
 * @param userId - UUID del usuario al que se le ajustará la reputación.
 * @param deltaPoints - Cantidad de puntos a sumar (positivo) o restar (negativo).
 */
export async function updateUserReputation(userId: string, deltaPoints: number): Promise<boolean> {
  if (deltaPoints === 0 || !userId) return true;

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc('increment_reputation', {
      target_user_id: userId,
      delta_points: deltaPoints,
    });

    if (error) {
      console.error('Error al actualizar la reputación del usuario:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Excepción al actualizar reputación:', err);
    return false;
  }
}