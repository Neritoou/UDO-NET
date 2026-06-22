export type NotificationType = 'reply' | 'vote' | 'warning' | 'report'

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  reference_id: string | null
  is_read: boolean
  created_at: string
}
