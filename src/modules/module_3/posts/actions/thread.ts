'use server';

import { getThread as getThreadService, UnifiedPost } from '@module_3/posts/services/supabase-service';

export async function getThread(id: string): Promise<UnifiedPost | null> {
    try {
        return await getThreadService(id);
    } catch (error) {
        console.error("Error al obtener el hilo:", error);
        return null;
    }
}