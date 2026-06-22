export type TargetType = 'post' | 'reply' | 'user' | 'community'
export type ReportStatus = 'pendiente' | 'aprobado' | 'rechazado'

export type Report = {
  id: string
  reporter_id: string
  target_type: TargetType
  target_id: string
  reason: string
  description: string | null
  status: ReportStatus
  created_at: string
}
