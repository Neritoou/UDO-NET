'use server';

import { createClient } from '@/lib/db/server';
import { calculateWeight } from '@/modules/module_4/votes/services/weight.service';
import { createNotification } from '@/modules/module_4/notifications/services/notification.service';
import { getCurrentUserId } from '@module_1/auth/exports';
import { revalidatePath } from 'next/cache';

/**
 * Registra un voto (upvote/downvote) en una respuesta usando Server Actions.
 */
export async function castVote(replyId: string, value: 1 | -1) {
  try {
    if (!replyId || (value !== 1 && value !== -1)) {
      return { success: false, error: 'Parámetros inválidos. Se requiere replyId y value (1 | -1).' };
    }

    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return { success: false, error: 'Debes iniciar sesión para votar.' };
    }

    const supabase = await createClient();

    // 1. Anti-Self-Voting y validación de estado del post padre
    const { data: reply, error: replyError } = await supabase
      .from('replies')
      .select('user_id, post_id')
      .eq('id', replyId)
      .single();

    if (replyError || !reply) {
      return { success: false, error: 'La respuesta especificada no existe.' };
    }

    if (reply.user_id === currentUserId) {
      return { success: false, error: 'No puedes votar tu propio contenido.' };
    }

    const { data: post } = await supabase
      .from('posts')
      .select('status')
      .eq('id', reply.post_id)
      .single();

    if (post?.status === 'closed') {
      return { success: false, error: 'No se permiten votos en publicaciones cerradas.' };
    }

    // 2. Verificar si ya existe un voto del usuario en esta respuesta
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, value')
      .eq('user_id', currentUserId)
      .eq('reply_id', replyId)
      .maybeSingle();

    const weight = await calculateWeight(currentUserId);
    let shouldNotify = false;

    // 3. Lógica de mutación (insertar, actualizar o eliminar)
    if (existingVote) {
      if (existingVote.value === value) {
        const { error: deleteError } = await supabase.from('votes').delete().eq('id', existingVote.id);
        if (deleteError) throw deleteError;
      } else {
        const { error: updateError } = await supabase
          .from('votes')
          .update({ value, weight })
          .eq('id', existingVote.id);
        if (updateError) throw updateError;
        shouldNotify = true;
      }
    } else {
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: currentUserId,
          reply_id: replyId,
          value,
          weight,
        });
      if (insertError) throw insertError;
      shouldNotify = true;
    }

    // 4. Actualizar el vote_count de la respuesta
    const { data: votesAgg, error: aggError } = await supabase
      .from('votes')
      .select('value, weight')
      .eq('reply_id', replyId);

    if (!aggError && votesAgg) {
      const totalVoteCount = votesAgg.reduce(
        (sum: number, v: { value: number; weight: number }) => sum + v.value * (v.weight || 1),
        0
      );

      await supabase
        .from('replies')
        .update({ vote_count: Math.round(totalVoteCount) })
        .eq('id', replyId);
    }

    // 5. Notificar al autor solo si el voto se agregó o cambió
    if (shouldNotify) {
      await createNotification(reply.user_id, 'vote', replyId);
    }

    // 6. Revalidar la caché
    revalidatePath('/', 'layout');

    return { success: true };
  } catch {
    return { success: false, error: 'Error interno del servidor.' };
  }
}