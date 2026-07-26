import { createClient } from '@/lib/db/server';

interface VotePayload {
  userId: string;
  postId: string;
  voteType: 'upvote' | 'downvote';
}

interface ServiceResponse {
  success: boolean;
  message: string;
  weightUsed?: number;
}

/**
 * Servicio para gestionar la lógica de negocio y queries de votaciones en el foro.
 */
export const voteService = {
  /**
   * Ejecuta las validaciones del foro, calcula el peso e inserta/actualiza el voto.
   */
  async castVote(payload: VotePayload): Promise<ServiceResponse> {
    const { userId, postId, voteType } = payload;
    const supabase = await createClient();

    try {
      // ----------------------------------------------------------------
      // 1. QUERY: Validar existencia y estado de la entidad votada
      // ----------------------------------------------------------------
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('is_locked, status')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        return { success: false, message: 'La publicación no existe o no pudo ser verificada.' };
      }

      if (post.is_locked || post.status === 'archived') {
        return { success: false, message: 'No se permiten votos en publicaciones cerradas o archivadas.' };
      }

      // ----------------------------------------------------------------
      // 2. QUERY & CORRECCIÓN 3: Validar usuario, rol y penalizaciones
      // ----------------------------------------------------------------
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role, reputation, is_banned')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { success: false, message: 'Usuario no válido para votar.' };
      }

      // Restricción académica: Usuarios baneados no tienen derecho a voto
      if (user.is_banned) {
        return { success: false, message: 'Tu cuenta se encuentra suspendida temporalmente.' };
      }

      // Cálculo del peso del voto (Lógica de negocio original)
      let voteWeight = 1.0;
      if (user.role === 'moderator' || user.reputation > 1000) {
        voteWeight = 2.0;
      }

      // ----------------------------------------------------------------
      // 3. QUERY: Evitar duplicados (Restricción de unicidad)
      // ----------------------------------------------------------------
      const { data: existingVote, error: voteError } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle(); // Evita lanzar error si no encuentra registros

      if (voteError) {
        throw voteError;
      }

      // ----------------------------------------------------------------
      // 4. QUERY: Registro, mutación y auditoría del voto
      // ----------------------------------------------------------------
      if (existingVote) {
        // Si el voto actual es idéntico, el usuario está cancelando su voto
        if (existingVote.vote_type === voteType) {
          const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          if (deleteError) throw deleteError;
          return { success: true, message: 'Voto retirado exitosamente.', weightUsed: 0 };
        } else {
          // Si el tipo es diferente (ej. cambió de upvote a downvote), se actualiza
          const { error: updateError } = await supabase
            .from('votes')
            .update({ vote_type: voteType, weight: voteWeight, updated_at: new Date().toISOString() })
            .eq('id', existingVote.id);

          if (updateError) throw updateError;
          return { success: true, message: 'Voto actualizado exitosamente.', weightUsed: voteWeight };
        }
      }

      // Si no existe voto previo, se inserta uno nuevo
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: userId,
          post_id: postId,
          vote_type: voteType,
          weight: voteWeight
        });

      if (insertError) throw insertError;

      return { success: true, message: 'Voto registrado exitosamente.', weightUsed: voteWeight };

    } catch (error) {
      console.error('Error crítico en voteService.castVote:', error);
      return { success: false, message: 'Ocurrió un error inesperado al procesar el voto.' };
    }
  }
};
