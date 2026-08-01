'use server';

import { revalidatePath } from 'next/cache';
import { mockPosts, MockReply } from '@module_3/posts/services/mock-data';
import fs from 'fs/promises';
import path from 'path';

const JSON_FILE_PATH = path.join(process.cwd(), "src", "modules", "module_3", "posts", "services", "mock-posts-extra.json");

export async function addReplyAction(postId: string, parentId: string | null, content: string) {
    try {
        if (!content || !content.trim()) {
            return { success: false, error: "El contenido no puede estar vacío." };
        }

        const newReply: MockReply = {
            id: `resp_${crypto.randomUUID().substring(0, 8)}`,
            author: { username: 'UsuarioActivo' },
            content: content.trim(),
            createdAt: new Date(),
            votes: 0,
            nestedReplies: []
        };

        const post = mockPosts.find(p => p.id === postId);
        if (!post) {
            return { success: false, error: "El post no existe." };
        }

        if (parentId === null) {
            post.replies.push(newReply);
        } else {
            const insertRecursive = (repliesList: MockReply[]): boolean => {
                for (let r of repliesList) {
                    if (r.id === parentId) {
                        if (!r.nestedReplies) r.nestedReplies = [];
                        r.nestedReplies.push(newReply);
                        return true;
                    }
                    if (r.nestedReplies && insertRecursive(r.nestedReplies)) return true;
                }
                return false;
            };
            insertRecursive(post.replies);
        }
        post.repliesCount = (post.repliesCount || 0) + 1;

        try {
            const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
            let extraPosts = JSON.parse(fileContent);
            const index = extraPosts.findIndex((p: any) => p.id === postId);
            
            if (index !== -1) {
                extraPosts[index] = post;
                await fs.writeFile(JSON_FILE_PATH, JSON.stringify(extraPosts, null, 2), 'utf-8');
            }
        } catch {
            // Si el post pertenece a los estáticos fijos, se mantiene en memoria sin error crítico
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error al guardar respuesta:", error);
        return { success: false, error: "No se pudo guardar la respuesta." };
    }

    const mentionRegex = /@([\w_]+)/g;
    let match;
    const mentionedUser : string[] = [];

    while ((match = mentionRegex.exec(content.trim())) !== null) {
        mentionedUser.push(match[1]); 
    }

    if (mentionedUser.length > 0) {

        // conexiones al modulo 4
        //import de funcion
        //await modulo 4
        
        console.log("Usuario mencionado detectado:", mentionedUser);
    }
}