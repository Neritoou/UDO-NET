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