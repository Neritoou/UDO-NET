import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import type { ReputationResponse } from '@/modules/module_4/types';

/**
 * GET /api/reputation/[userId]
 * Lógica:
 * 1. postsScore: COUNT de respuestas recibidas en posts del usuario.
 * 2. repliesScore: SUM(value * weight) de votos en respuestas del usuario.
 * 3. globalReputation = postsScore + repliesScore.
 * 4. Efecto secundario: UPDATE users SET reputation = globalReputation.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. Inicializar la conexión a Supabase con la configuración del equipo
    const supabase = await createClient();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro userId.' },
        { status: 400 }
      );
    }

    // 1. Puntos por Posts (postsScore)
    // Contar las respuestas recibidas en todos los posts donde el usuario es autor
    const { data: userPosts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('author_id', userId);

    if (postsError) {
      console.error('Error al consultar posts del usuario:', postsError.message);
      return NextResponse.json(
        { error: 'Error al calcular puntos por posts.' },
        { status: 500 }
      );
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
        return NextResponse.json(
          { error: 'Error al calcular puntos por posts.' },
          { status: 500 }
        );
      }

      postsScore = count ?? 0;
    }

    //  Puntos por Respuestas (repliesScore)
    // Obtener todas las respuestas del usuario
    const { data: userReplies, error: userRepliesError } = await supabase
      .from('replies')
      .select('id')
      .eq('user_id', userId);

    if (userRepliesError) {
      console.error('Error al consultar respuestas del usuario:', userRepliesError.message);
      return NextResponse.json(
        { error: 'Error al calcular puntos por respuestas.' },
        { status: 500 }
      );
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
        return NextResponse.json(
          { error: 'Error al calcular puntos por respuestas.' },
          { status: 500 }
        );
      }

      if (votes) {
        repliesScore = votes.reduce(
  (sum: number, v: { value: number; weight: number }) => sum + v.value * v.weight,
  0
);
      }
    }

    //3. Rango Global
    const globalReputation = postsScore + repliesScore;

    //4. Efecto Secundario: Actualizar la reputación del usuario
    const { error: updateError } = await supabase
      .from('users')
      .update({ reputation: globalReputation })
      .eq('id', userId);

    if (updateError) {
      console.error('Error al actualizar reputación:', updateError.message);
      return NextResponse.json(
        { error: 'Error al actualizar la reputación del usuario.' },
        { status: 500 }
      );
    }

    // Respuesta
    const response: ReputationResponse = {
      success: true,
      postsScore,
      repliesScore,
      globalReputation,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error inesperado en GET /api/reputation/[userId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}