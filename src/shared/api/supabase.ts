import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { INITIAL_MOCK_CLIENTS, generateMockHistory } from "./mockData"
import type { Client, Message, CursorPaginatedMessages } from "@/shared/types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your_anon_key_here" &&
  !supabaseAnonKey.startsWith("eyJh...")
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// In-memory mock storage if Supabase is not connected
class MockBackend {
  private clients: Client[] = [...INITIAL_MOCK_CLIENTS]
  private messagesMap: Map<number, Message[]> = new Map()
  private subscribers: Set<(msg: Message) => void> = new Set()

  constructor() {
    for (const c of this.clients) {
      this.messagesMap.set(c.id, generateMockHistory(c.id))
    }
  }

  async getClients(): Promise<Client[]> {
    return [...this.clients].sort(
      (a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
    )
  }

  async getMessages(
    clientId: number,
    cursor?: string | null,
    limit: number = 20
  ): Promise<CursorPaginatedMessages> {
    const all = this.messagesMap.get(clientId) || []
    
    // Хронологически all отсортирован по возрастанию created_at
    // Курсор - это created_at самого старого загруженного сообщения
    let filtered = all
    if (cursor) {
      const cursorTime = new Date(cursor).getTime()
      filtered = all.filter((m) => new Date(m.created_at).getTime() < cursorTime)
    }

    // Берем последние limit сообщений из отфильтрованного списка (то есть самые свежие перед курсором)
    const startIndex = Math.max(0, filtered.length - limit)
    const slice = filtered.slice(startIndex)
    const hasMore = startIndex > 0
    const nextCursor = hasMore && slice.length > 0 ? slice[0].created_at : null

    return {
      messages: slice,
      nextCursor,
      hasMore,
    }
  }

  async sendMessage(clientId: number, sender: "client" | "bot", text: string): Promise<Message> {
    const newMessage: Message = {
      id: Date.now(),
      client_id: clientId,
      sender,
      text,
      created_at: new Date().toISOString(),
    }

    const current = this.messagesMap.get(clientId) || []
    current.push(newMessage)
    this.messagesMap.set(clientId, current)

    // Обновляем активность клиента
    const client = this.clients.find((c) => c.id === clientId)
    if (client) {
      client.last_activity_at = newMessage.created_at
    }

    // Оповещаем подписчиков
    this.subscribers.forEach((cb) => cb(newMessage))

    return newMessage
  }

  subscribe(callback: (msg: Message) => void) {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }
}

export const mockBackend = new MockBackend()
