import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { INITIAL_MOCK_CLIENTS, generateMockHistory } from "./mockData"
import type { Client, Message, CursorPaginatedMessages, Article, CreateArticleInput, UpdateArticleInput } from "@/shared/types"


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

  // Articles mock support
  private articles: Article[] = [
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      title: "Быстрый старт с курсами валют в Telegram",
      slug: "quickstart-telegram-currency-bot",
      content: "# Быстрый старт\n\nЭтот бот позволяет получать курсы валют мгновенно. Просто отправьте код валюты (USD, EUR, GBP)!",
      status: "published",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      title: "Архитектура Edge Functions и Supabase Realtime",
      slug: "edge-functions-supabase-realtime",
      content: "Подробный обзор взаимодействия Deno Edge Functions и PostgreSQL CDC через Realtime каналы.",
      status: "draft",
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ]

  async getArticles(): Promise<Article[]> {
    return [...this.articles].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  async getArticleById(id: string): Promise<Article | null> {
    return this.articles.find((a) => a.id === id) || null
  }

  async createArticle(input: CreateArticleInput): Promise<Article> {
    const newArticle: Article = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: input.title,
      slug: input.slug,
      content: input.content || "",
      status: input.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.articles.unshift(newArticle)
    return newArticle
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article> {
    const idx = this.articles.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw new Error("Article not found")
    }
    const current = this.articles[idx]
    const updated: Article = {
      ...current,
      ...input,
      updated_at: new Date().toISOString(),
    }
    this.articles[idx] = updated
    return updated
  }

  async deleteArticle(id: string): Promise<void> {
    this.articles = this.articles.filter((a) => a.id !== id)
  }
}

export const mockBackend = new MockBackend()

