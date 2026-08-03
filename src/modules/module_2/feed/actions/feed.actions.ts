'use server';

import { getRankedCommunityFeed } from "@module_2/feed/services/feed.service";
import type { UnifiedPost } from "@module_3/posts/exports";

/**
 * Server Action que trae el feed de una comunidad ya
 * rankeado por el heap. Se llama directamente desde un Server Component
 * (await) o desde un Client Component vía useTransition/useEffect.
 */
export async function getCommunityFeedAction(
    communityId: string,
    limit: number = 20
): Promise<UnifiedPost[]> {
    try {
        if (!communityId) return [];
        return await getRankedCommunityFeed(communityId, limit);
    } catch (error) {
        console.error("Error al obtener el feed de la comunidad:", error);
        return [];
    }
}