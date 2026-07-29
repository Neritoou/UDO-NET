'use server'; // 👈 Obligatorio al inicio del archivo

import { createClient } from '@/lib/db/server';
import type { ReputationResponse } from '@/modules/module_4/types';

/**
 * Calcula y actualiza la reputación global de un usuario.
 * 
 * Lógica:
 * 1. postsScore: COUNT de respuestas recibidas en posts del usuario.
 * 2. repliesScore: SUM(value * weight) de votos en respuestas del usuario.
 * 3. globalReputation = postsScore + repliesScore.
 * 4. Efecto secundario: UPDATE users SET reputation = globalReputation.
 */
export async function updateUserReputation(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'Se requiere el parámetro userId.' };
    }

    // 1. Inicializar la conexión a Supabase con la configuración del equipo
    const supabase = await createClient();

    // 1. Puntos por Posts (postsScore)
    // MOCK: Simulamos la respuesta de Supabase para los posts sin tocar la base de datos
    const { data: userPosts, error: postsError } = {
      data: [
        { id: 'post-mock-1' }, 
        { id: 'post-mock-2' },   //TODO: usar getPostByUser del Modulo 3
        { id: 'post-mock-3' }
      ],
      error: null
    };

    if (postsError) {
      console.error('Error al consultar posts del usuario:', postsError.message);
      return { success: false, error: 'Error al calcular puntos por posts.' };
    }

    let postsScore = 0;

    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map((p: { id: string }) => p.id);

      const { count, error: repliesCountError } = await supabase
        .from('replies')
        .select('id', { count: 'exact', head: true })
        .in('post_id', postIds);

      if (repliesCountError) {
        console.error('Error al contar respuestas en posts:', repliesCountError.message);
        return { success: false, error: 'Error al calcular puntos por posts.' };
      }

      postsScore = count ?? 0;
    }

    // 2. Puntos por Respuestas (repliesScore)
    // MOCK: Simulamos la respuesta de Supabase para las respuestas del usuario sin tocar la base de datos
    const { data: userReplies, error: userRepliesError } = {
      data: [
        { id: 'reply-mock-1' },
        { id: 'reply-mock-2' }   //TODO: usar getPostByUser del Modulo 3
      ],
      error: null
    };

    if (userRepliesError) {
      console.error('Error al consultar respuestas del usuario:', userRepliesError.message);
      return { success: false, error: 'Error al calcular puntos por respuestas.' };
    }

    let repliesScore = 0;

    if (userReplies && userReplies.length > 0) {
      const replyIds = userReplies.map((r: { id: string }) => r.id);

      // Obtener todos los votos en las respuestas del usuario y calcular SUM(value * weight)
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('value, weight')
        .in('reply_id', replyIds);

      if (votesError) {
        console.error('Error al consultar votos:', votesError.message);
        return { success: false, error: 'Error al calcular puntos por respuestas.' };
      }

      if (votes) {
        repliesScore = votes.reduce(
          (sum: number, v: { value: number; weight: number }) => sum + v.value * v.weight,
          0
        );
      }
    }

    // 3. Rango Global
    const globalReputation = postsScore + repliesScore;

    // 4. Efecto Secundario: Actualizar la reputación del usuario en la base de datos
    const { error: updateError } = await supabase
      .from('users')
      .update({ reputation: globalReputation })
      .eq('id', userId);

    if (updateError) {
      console.error('Error al actualizar reputación:', updateError.message);
      return { success: false, error: 'Error al actualizar la reputación del usuario.' };
    }

    // Estructura de la respuesta tipada correctamente
    const response: ReputationResponse = {
      success: true,
      postsScore,
      repliesScore,
      globalReputation,
    };

    return response;
  } catch (error) {
    console.error('Error inesperado en updateUserReputation:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}
