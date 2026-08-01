import { createClient } from "@/lib/db/server";
import { User } from "@/lib/types";
import { Warning } from "@/lib/types/warning";
import { verifyModeratorPermission } from "@module_5/moderation/exports";

const WARNING_LIMIT = 3; 

export class WarningService {
  /**
   * Crea y emite una advertencia formal a un usuario.
   * @param userId - ID del usuario que recibirá la advertencia.
   * @param moderator - Moderador que emite la advertencia.
   * @param type - Tipo de advertencia.
   * @param reason - Motivo de la advertencia.
   * @param expiresAt - Fecha de expiración en formato ISO.
   */
  public async createWarning(
    userId: string, 
    moderator: User, 
    type: string, 
    reason: string, 
    expiresAt: string
  ): Promise<void> {
    const auth = verifyModeratorPermission(moderator);
    if (!auth.isAuthorized) throw new Error(auth.reason);

    const supabase = await createClient();
    
    const { error } = await supabase
      .from("warnings")
      .insert({
        user_id: userId,
        moderator_id: moderator.id,
        type,
        reason,
        expires_at: expiresAt
      });

    if (error) throw new Error(`Failed to create warning: ${error.message}`);
  }

  /**
   * Obtiene el historial de advertencias activas de un usuario.
   * Utilizado para mostrarlas discretamente en el perfil del usuario.
   * @param userId - ID del usuario a consultar.
   * @returns Arreglo de advertencias activas.
   */
  public async getActiveUserWarnings(userId: string): Promise<Warning[]> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("warnings")
      .select("*")
      .eq("user_id", userId)
      .gt("expires_at", now);

    if (error) throw new Error(`Failed to fetch user warnings: ${error.message}`);
    return data as Warning[];
  }

  /**
   * Verifica si el usuario ha superado el límite de advertencias y debe ser restringido.
   * @param userId - ID del usuario a verificar.
   * @returns true si el usuario puede publicar, false si está restringido.
   */
  public async getUserPostingPermission(userId: string): Promise<boolean> {
    const activeWarnings = await this.getActiveUserWarnings(userId);
    return activeWarnings.length < WARNING_LIMIT;
  }
}