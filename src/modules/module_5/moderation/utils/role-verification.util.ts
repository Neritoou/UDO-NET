import { User, UserRole } from "@/lib/types";

export interface AuthorizationResult {
  isAuthorized: boolean;
  reason?: string;
}

/**
 * Valida si un usuario posee los niveles de acceso requeridos para realizar acciones de moderación.
 * Se basa estrictamente en la estructura global 'User' y sus roles oficiales.
 * @param user - El objeto de usuario obtenido de la sesión actual de la base de datos.
 * @returns Un objeto con el estado de la autorización y el motivo en caso de denegación.
 */
export function verifyModeratorPermission(user: User): AuthorizationResult {
  const allowedRoles: UserRole[] = ["moderator", "admin"];

  if (!allowedRoles.includes(user.role)) {
    return {
      isAuthorized: false,
      reason: "User does not possess sufficient moderation privileges."
    };
  }

  return {
    isAuthorized: true
  };
}