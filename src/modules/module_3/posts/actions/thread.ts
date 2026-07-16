'use server';

import { mockPosts, MockPost } from '@module_3/posts/services/mock-data';

export async function getThread(id: string): Promise<MockPost | null> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const foundThread = mockPosts.find(post => post.id === id);
        
        if (!foundThread) {
            return null;
        }

        return foundThread;
    } catch (error) {
        console.error("Error al obtener el hilo:", error);
        return null;
    }
}