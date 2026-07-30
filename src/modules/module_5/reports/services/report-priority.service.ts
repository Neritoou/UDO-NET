import { Report, ReportStatus } from "@/lib/types/report";
import { createClient } from "@/lib/db/server"; 

export class ReportPriorityService {
  /**
   * Evalúa el peso o relevancia de un reporte basado en las propiedades reales del tipo Report.
   * @param report - El objeto de reporte individual traído de la base de datos.
   * @returns Un cálculo numérico que representa la prioridad/gravedad del reporte.
   */
  public calculateReportScore(report: Report): number {
    let score = 0;

    // Asignación de prioridad según el tipo de objetivo (target_type)
    // Reportar a un usuario o una comunidad entera suele ser más grave que un post/comentario
    if (report.target_type === "user") {
      score += 20;
    } else if (report.target_type === "community") {
      score += 15;
    } else if (report.target_type === "post") {
      score += 10;
    } else {
      score += 5;
    }

    // Lista de motivos de infracción considerados de alta gravedad
    const highSeverityReasons = ["terrorism", "suicide", "sexual", "harassment"];
    
    if (highSeverityReasons.includes(report.reason.toLowerCase())) {
      score += 30; // Infracciones críticas reciben un gran peso de prioridad
    } else {
      score += 10; // Infracciones comunes u otros motivos
    }

    return score;
  }

  /**
   * Obtiene todos los reportes con estado 'pending' directamente desde Supabase
   * y los ordena de mayor a menor gravedad usando la heurística de prioridad.
   */
  public async getPrioritizedReports(): Promise<Report[]> {
    try {
      const supabase = await createClient();

      const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .eq("status", "pendiente" as ReportStatus);

      if (error) throw new Error(`Failed to fetch reports: ${error.message}`);

      return (reports as Report[]).sort((a, b) =>
        this.calculateReportScore(b) - this.calculateReportScore(a)
      );
    } catch (err) {
      console.warn("ReportPriorityService.getPrioritizedReports: unable to fetch reports, returning empty list.", err);
      return [];
    }
  }
}