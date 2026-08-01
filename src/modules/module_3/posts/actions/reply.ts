'use server';

import { revalidatePath } from 'next/cache';
import { addReply } from '@module_3/posts/services/supabase-service';
import { createNotification } from '@module_4/notifications/services/notification.service';
import { createClient } from '@/lib/db/server';

export async function addReplyAction(postId: string, parentId: string | null, content: string) {
    try {
        if (!content || !content.trim()) {
            return { success: false, error: "El contenido no puede estar vacío." };
        }

        const result = await addReply(postId, parentId, content);

        if (result.success) {
            const supabase = await createClient();

            // 1. Notificar al autor del post (Módulo 4)
            const { data: postData } = await supabase
                .from('posts')
                .select('author_id')
                .eq('id', postId)
                .single();

            if (postData?.author_id) {
                await createNotification(postData.author_id, 'reply', postId);
            }

            // 2. Procesar Menciones (Módulo 4)
            const mentionRegex = /@([\w_]+)/g;
            let match;
            const mentionedUsers: string[] = [];

            while ((match = mentionRegex.exec(content.trim())) !== null) {
                mentionedUsers.push(match[1]);
            }

            if (mentionedUsers.length > 0) {
                // Buscar los IDs de los usuarios usando sus usernames
                const { data: usersData, error } = await supabase
                    .from('users')
                    .select('id, username')
                    .in('username', mentionedUsers);

                if (!error && usersData) {
                    for (const user of usersData) {
                        await createNotification(user.id, 'reply' as any, postId);
                    }
                }
            }

            revalidatePath("/");
        }
        return result;
    } catch (error) {
        console.error("Error al guardar respuesta:", error);
        return { success: false, error: "No se pudo guardar la respuesta en la base de datos." };
    }
}