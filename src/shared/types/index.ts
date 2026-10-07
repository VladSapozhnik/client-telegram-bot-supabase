export interface Client {
  id: number
  first_name: string | null
  last_name: string | null
  username: string | null
  last_activity_at: string
  created_at: string
}

export interface Message {
  id: number
  client_id: number
  sender: "client" | "bot"
  text: string
  created_at: string
}

export interface CursorPaginatedMessages {
  messages: Message[]
  nextCursor: string | null // created_at of earliest message in batch
  hasMore: boolean
}
