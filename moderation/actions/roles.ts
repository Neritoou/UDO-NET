
export type RolUsuario = "moderador" | "usuario";

export interface Usuario {
  id: string;
  nombre: string;
  rol: RolUsuario;
  comunidadesPermitidas: string[] | null; 
}

export interface ResultadoAutorizacion {
  autorizado: boolean;
  motivo: string;
}

/*
 - Evalúa si un usuario posee el rol necesarios para moderar
   una comunidad específica. Solo los moderadores de la comunidad correspondiente
   tienen el acceso concedido.
 - "usuario" es el objeto del usuario que intenta realizar la acción.
 - "comunidad" El identificador de la comunidad donde se ejecuta la acción.
 */
export function verificarPermiso(
  usuario: Usuario,
  comunidad: string
): ResultadoAutorizacion {

  if (usuario.rol === "moderador") {
    const tieneAcceso = usuario.comunidadesPermitidas?.includes(comunidad);
    
    if (tieneAcceso) {
      return {
        autorizado: true,
        motivo: `Acceso concedido como Moderador de la comunidad: [${comunidad}]`
      };
    }

    return {
      autorizado: false,
      motivo: `Permiso denegado: El moderador no pertenece a la comunidad [${comunidad}]`
    };
  }

  // Cualquier usuario con rol diferente es rechazado automáticamente
  return {
    autorizado: false,
    motivo: "Permiso denegado: El usuario no posee el rol de moderador"
  };
}