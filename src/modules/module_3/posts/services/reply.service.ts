import { createClient } from '@/lib/db/server';
import { ActionResponse, DatabaseReply } from './post.service';

// Construye el árbol jerárquico de respuestas N-ario en O(n) indexando con Map O(1)
export function buildReplyTree(flatReplies: DatabaseReply[]): DatabaseReply[] {
  const replyMap = new Map<string, DatabaseReply>();
  const roots: DatabaseReply[] = [];

  flatReplies.forEach(r => {
    replyMap.set(r.id, { ...r, nestedReplies: [] });
  });

  flatReplies.forEach(r => {
    const node = replyMap.get(r.id)!;
    if (r.parent_id) {
      const parent = replyMap.get(r.parent_id);
      if (parent) parent.nestedReplies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function addReply(postId: string, parentId: string | null, content: string): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para responder.' };
  }

  const userId = user.id;

  const { error } = await supabase.from('replies').insert({
    content,
    post_id: postId,
    parent_id: parentId,
    user_id: userId
  });

  if (error) {
    return { success: false, error: 'No se pudo guardar la respuesta.' };
  }

  return { success: true, message: 'Respuesta guardada con éxito.' };
}
