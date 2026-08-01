'use server';

import { search, UnifiedPost } from '@module_3/posts/services/supabase-service';

export async function searchPosts(term: string = '', community?: string, tags?: string[], filter: string = 'respondidos'): Promise<UnifiedPost[]> {
    try {
        return await search(term, community, tags, filter);
    } catch (error) {
        console.error("Error al realizar la búsqueda:", error);
        return [];
    }
}