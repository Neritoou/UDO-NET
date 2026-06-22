export type Vote = {
  id: string
  user_id: string
  reply_id: string
  value: 1 | -1
  weight: number
  created_at: string
}
