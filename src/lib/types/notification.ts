export type NotificationType = 'reply' | 'vote' | 'warning' | 'report' | 'mention'

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  reference_id: string | null

  // This is a memory only field. It does not affect in any way the database. It is kind of like a caché. 
  target_post_id?: string | null
  is_read: boolean
  created_at: string
}
