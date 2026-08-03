import { getPostsAction } from "@module_3/posts/exports";
import type { UnifiedPost } from "@module_3/posts/exports";
import { MaxHeap } from "@module_2/feed/utils/max-heap";

/**
 * "Hot" ranking score, la misma idea que el algoritmo de Reddit: combina
 * el conteo de votos (en escala logarítmica, para que los primeros votos
 * pesen más que los siguientes) con un impulso lineal por tiempo, para que
 * un post reciente no quede enterrado para siempre bajo uno viejo con
 * muchos votos.
 *
 * score = sign(votos) * log10(max(|votos|, 1)) + segundosDesdeEpoch / 45000
 *
 * El divisor 45000 hace que el componente de tiempo suba ~1 punto cada
 * 12.5 horas, un orden de magnitud parecido a un salto de log10 en votos,
 * para que ni el tiempo ni los votos dominen por completo al otro.
 */
function computeHotScore(voteCount: number, createdAt: string): number {
    const order = Math.log10(Math.max(Math.abs(voteCount), 1));
    const sign = voteCount > 0 ? 1 : voteCount < 0 ? -1 : 0;
    const secondsSinceEpoch = new Date(createdAt).getTime() / 1000;

  return sign * order + secondsSinceEpoch / 45000;
}

interface ScoredPost {
    post: UnifiedPost;
    score: number;
}

/**
 * Arma el feed rankeado de una comunidad (o subcomunidad) usando un
 * max-heap: cada post candidato se puntúa una vez (O(1)) y se inserta en
 * el heap (O(log n)); luego se extraen los `limit` mejores en orden
 * (O(limit log n)) en vez de ordenar toda la lista de candidatos cada vez.
 *
 * Los posts siguen siendo propiedad del Módulo 3 — esta función nunca
 * consulta la tabla `posts` directamente. Solo usa `getPostsAction`, la
 * función de solo lectura que Módulo 3 expone en su barril, y hace su
 * propio filtrado y ranking sobre esos datos.
 */
export async function getRankedCommunityFeed(
    communityId: string,
    limit: number = 20
    ): Promise<UnifiedPost[]> {
    const allPosts: UnifiedPost[] = await getPostsAction();

    const communityPosts = allPosts.filter((post) => post.community_id === communityId);

    if (communityPosts.length === 0) return [];

    const heap = MaxHeap.fromArray<ScoredPost>(
        communityPosts.map((post) => ({
        post,
        score: computeHotScore(post.votes_count, post.created_at),
        })),
        (a, b) => a.score - b.score
    );

    const ranked: UnifiedPost[] = [];

    while (ranked.length < limit && !heap.isEmpty()) {
        ranked.push(heap.extractMax()!.post);
    }

    return ranked;
}