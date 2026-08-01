'use server'; // 👈 Obligatorio al inicio del archivo

import { createClient } from '@/lib/db/server';
import { calculateWeight } from '@/modules/module_4/votes/services/weight.service';
import { createNotification } from '@/modules/module_4/notifications/services/notification.service';
import type { VotePayload } from '@/modules/module_4/types';
import { revalidatePath } from 'next/cache'; // 👈 IMPORTANTE para actualizar la UI

/**
 * Registra un voto (upvote/downvote) en una respuesta usando Server Actions.
 */
export async function castVote(payload: VotePayload) {
  try {
    const { replyId, value } = payload;

    // Validar el payload de entrada
    if (!replyId || (value !== 1 && value !== -1)) {
      return { success: false, error: 'Payload inválido. Se requiere replyId y value (1 | -1).' };
    }

    // Configuración del usuario mock asignado directamente
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'; 
    const currentUserId = MOCK_USER_ID;

    if (!currentUserId) {
      return { success: false, error: 'No se proporcionó el ID del usuario.' };
    }

    const supabase = await createClient();

    // 1. Anti-Self-Voting: Consultar quién es el autor de la respuesta
    const { data: reply, error: replyError } = await supabase
      .from('replies')
      .select('user_id')
      .eq('id', replyId)
      .single();

    if (replyError || !reply) {
      return { success: false, error: 'La respuesta especificada no existe.' };
    }

    if (reply.user_id === currentUserId) {
      return { success: false, error: 'No puedes votar tu propio contenido.' };
    }

    // 2. Calcular peso dinámico del voto 
    const weight = await calculateWeight(currentUserId);

    // 3. UPSERT del voto 
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .upsert(
        {
          user_id: currentUserId,
          reply_id: replyId,
          value,
          weight,
        },
        {
          onConflict: 'user_id,reply_id', // 👈 Requiere restricción UNIQUE en Postgres
        }
      )
      .select()
      .single();

    if (voteError) {
      console.error('Error al insertar/actualizar voto:', voteError.message);
      return { success: false, error: 'Error al registrar el voto.' };
    }

    // 4. Actualizar el vote_count de la respuesta de forma segura
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

    // 5. Notificar al autor de la respuesta 
    try {
      await createNotification(reply.user_id, 'vote', replyId);
    } catch (notifError) {
      console.error('Error al enviar la notificación:', notifError);
    }

    // 6. Revalidar la caché bajo demanda para que la UI se actualice automáticamente
    // Cambia '/' por la ruta específica de tus respuestas si aplica (ej: `/questions/${questionId}`)
    revalidatePath('/', 'layout');

    return { success: true, vote };
  } catch (error) {
    console.error('Error inesperado en castVote:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}