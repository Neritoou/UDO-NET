export type MotivoReporte =
  | "odio"
  | "acoso"
  | "sexual"
  | "spam"
  | "terrorismo"
  | "violencia"
  | "discriminacion"
  | "suicidio"
  | "falso";

export type RangoReportante = "regular" | "alta-reputacion" | "moderador";

export interface Reportante {
  id: string;
  rango: RangoReportante;
}

export interface Reporte {
  id: string;
  contenidoId: string; // ID de la publicación, respuesta o perfil reportado
  tipoContenido: "post" | "reply" | "profile";
  motivo: MotivoReporte;
  reportante: Reportante;
  fechaCreacion: Date;
}

/**
 - Representa un elemento agrupado dentro de la cola de prioridad de moderación.
 - Múltiples reportes sobre un mismo contenido aumentan su prioridad acumulada.
 */
export interface ItemModeracion {
  contenidoId: string;
  tipoContenido: "post" | "reply" | "profile";
  reportes: Reporte[];
  prioridadAcumulada: number;
}