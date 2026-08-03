'use server'

import { createClient } from '@/lib/db/server'
import { getCurrentUserId } from '@module_1/auth/exports'
import type { TargetType, ReportStatus } from '@/lib/types/report'

export async function createReportAction(
  targetId: string,
  targetType: TargetType,
  reason: string,
  description?: string
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'Debes iniciar sesión para realizar un reporte.' }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('reports').insert({
      reporter_id: userId,
      target_id: targetId,
      target_type: targetType,
      reason,
      description: description || null,
      status: 'pending' as ReportStatus,
    })

    if (error) {
      return { success: false, error: 'No se pudo guardar el reporte en la base de datos.' }
    }

    return { success: true, message: 'Reporte enviado a moderación con éxito.' }
  } catch {
    return { success: false, error: 'Error al conectar con el servidor.' }
  }
}