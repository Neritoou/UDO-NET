import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import { calculateWeight } from '@/modules/module_4/votes/services/weight.service';
import { createNotification } from '@/modules/module_4/notifications/services/notification.service';
import type { VotePayload } from '@/modules/module_4/types';

/**
 * POST /api/votes
 *
 * Registra un voto (upvote/downvote) en una respuesta.
 *
 * Validaciones:
 * 1. Valida payload (replyId, value).
 * 2. Anti-Self-Voting: verifica que el votante no sea el autor de la respuesta.
 * 3. Calcula peso dinámico del voto según rol/reputación.
 * 4. Ejecuta UPSERT en la tabla votes.
 * 5. Notifica al autor de la respuesta.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Inicializar la conexión a Supabase con la configuración oficial del equipo
    const supabase = await createClient();

    //  Parsear y validar el body 
    const body: VotePayload = await request.json();
    const { replyId, value } = body;

    if (!replyId || (value !== 1 && value !== -1)) {
      return NextResponse.json(
        { error: 'Payload inválido. Se requiere replyId (string) y value (1 | -1).' },
        { status: 400 }
      );
    }

    //  Obtener el usuario actual
    // En una app real, el currentUserId vendría del token de sesión/autenticación.
    // Aquí lo leemos del header personalizado para demostración.
  const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'; 
  const currentUserId = MOCK_USER_ID;

    // 1. Anti-Self-Voting 
    // Consultar quién es el autor de la respuesta
    const { data: reply, error: replyError } = await supabase
      .from('replies')
      .select('user_id')
      .eq('id', replyId)
      .single();

    if (replyError || !reply) {
      return NextResponse.json(
        { error: 'La respuesta especificada no existe.' },
        { status: 400 }
      );
    }

    if (reply.user_id === currentUserId) {
      return NextResponse.json(
        { error: 'No puedes votar tu propio contenido' },
        { status: 403 }
      );
    }

    // 2. Calcular peso dinámico del voto 
    const weight = await calculateWeight(currentUserId);

    // 3. UPSERT del voto 
    // Si el usuario ya votó esta respuesta, se actualiza el valor y peso.
    // Si es un voto nuevo, se inserta.
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
          onConflict: 'user_id,reply_id',
        }
      )
      .select()
      .single();

    if (voteError) {
      console.error('Error al insertar/actualizar voto:', voteError.message);
      return NextResponse.json(
        { error: 'Error al registrar el voto.' },
        { status: 500 }
      );
    }

    //  4. Actualizar el vote_count de la respuesta
    // Recalcular el conteo total de votos para esta respuesta
    const { data: votesAgg, error: aggError } = await supabase
      .from('votes')
      .select('value, weight')
      .eq('reply_id', replyId);

    if (!aggError && votesAgg) {
      const totalVoteCount = votesAgg.reduce(
  (sum: number, v: { value: number; weight: number }) => sum + v.value * v.weight,
  0
);

      await supabase
        .from('replies')
        .update({ vote_count: Math.round(totalVoteCount) })
        .eq('id', replyId);
    }

    // 5. Notificar al autor de la respuesta 
    await createNotification(reply.user_id, 'vote', replyId);

    return NextResponse.json(
      { success: true, vote },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error inesperado en POST /api/votes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
