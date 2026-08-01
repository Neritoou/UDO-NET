'use server'; // 👈 Obligatorio al inicio del archivo

import { createClient } from '@/lib/db/server';
import { calculateWeight } from '@/modules/module_4/votes/services/weight.service';
import { createNotification } from '@/modules/module_4/notifications/services/notification.service';
import { revalidatePath } from 'next/cache'; // 👈 IMPORTANTE para actualizar la UI

/**
 * Registra un voto (upvote/downvote) en una respuesta usando Server Actions.
 */
export async function castVote(replyId: string, value: 1 | -1) {
  try {
    // Validar parámetros de entrada (Ya no usamos VotePayload)
    if (!replyId || (value !== 1 && value !== -1)) {
      return { success: false, error: 'Parámetros inválidos. Se requiere replyId y value (1 | -1).' };
    }

    // Configuración del usuario mock asignado directamente
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'; 
    const currentUserId = MOCK_USER_ID;

    if (!currentUserId) {
      return { success: false, error: 'No se proporcionó el ID del usuario.' };
    }

    const supabase = await createClient();

    // 1. Anti-Self-Voting & Validación de Estado: Consultar la respuesta y el estado de su post padre
    const { data: reply, error: replyError } = await supabase
      .from('replies')
      .select('user_id, post_id, posts!inner(status)')
      .eq('id', replyId)
      .single();

    if (replyError || !reply) {
      return { success: false, error: 'La respuesta especificada no existe.' };
    }

    if (reply.user_id === currentUserId) {
      return { success: false, error: 'No puedes votar tu propio contenido.' };
    }

    // @ts-ignore - Ignoramos tipado temporalmente por el inner join de Supabase
    if (reply.posts?.status === 'closed') {
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
    let actionMessage = '';

    // 3. Lógica de Mutación (Insertar, Actualizar o Eliminar)
    if (existingVote) {
      if (existingVote.value === value) {
        // Si presiona el mismo botón, el usuario está retirando su voto
        const { error: deleteError } = await supabase.from('votes').delete().eq('id', existingVote.id);
        if (deleteError) throw deleteError;
        actionMessage = 'Voto retirado exitosamente.';
      } else {
        // Si cambia de upvote a downvote (o viceversa), actualizamos
        const { error: updateError } = await supabase
          .from('votes')
          .update({ value, weight })
          .eq('id', existingVote.id);
        if (updateError) throw updateError;
        actionMessage = 'Voto actualizado exitosamente.';
      }
    } else {
      // Si no existe, insertamos un voto nuevo
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: currentUserId,
          reply_id: replyId,
          value,
          weight,
        });
      if (insertError) throw insertError;
      actionMessage = 'Voto registrado exitosamente.';
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

    // 5. Notificar al autor de la respuesta (Solo si el voto se agregó o cambió, no si se retiró)
    if (actionMessage !== 'Voto retirado exitosamente.') {
      try {
        await createNotification(reply.user_id, 'vote', replyId);
      } catch (notifError) {
        console.error('Error al enviar la notificación:', notifError);
      }
    }

    // 6. Revalidar la caché bajo demanda para que la UI se actualice automáticamente
    revalidatePath('/', 'layout');

    return { success: true, message: actionMessage };
  } catch (error) {
    console.error('Error inesperado en castVote:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}