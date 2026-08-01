import { createClient } from "@/lib/db/server";
import { User } from "@/lib/types";
import { verifyModeratorPermission } from "@module_5/moderation/exports";

export class ThreadManagementService {
  /**
   * Fija o desfija una publicación en la parte superior del foro.
   * @param post_id - ID de la publicación a modificar.
   * @param is_pinned - true para fijar, false para desfijar.
   * @param moderator - Objeto User del moderador.
   */
  public async updatePostPinStatus(post_id: string, is_pinned: boolean, moderator: User): Promise<void> {
    const auth = verifyModeratorPermission(moderator);
    if (!auth.isAuthorized) throw new Error(auth.reason);

    const supabase = await createClient();
    
    const { error } = await supabase
      .from("posts")
      .update({ is_pinned })
      .eq("id", post_id);

    if (error) throw new Error(`Failed to update pin status: ${error.message}`);
  }

  /**
   * Marca o desmarca un hilo/publicación como resuelto.
   * Aprovecha la columna 'status' de la tabla posts ('open' | 'closed').
   * @param post_id - ID de la publicación a modificar.
   * @param is_solved - true para marcar como resuelto (closed), false para revertir (open).
   * @param moderator - Objeto User del moderador.
   */
  public async updatePostSolvedStatus(post_id: string, is_solved: boolean, moderator: User): Promise<void> {
    const auth = verifyModeratorPermission(moderator);
    if (!auth.isAuthorized) throw new Error(auth.reason);

    const supabase = await createClient();
    const newStatus = is_solved ? "closed" : "open";

    const { error } = await supabase
      .from("posts")
      .update({ status: newStatus })
      .eq("id", post_id);

    if (error) throw new Error(`Failed to update solved status: ${error.message}`);
  }
}