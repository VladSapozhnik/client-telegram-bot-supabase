import { supabase, isSupabaseConfigured, mockBackend } from "@/shared/api/supabase"
import type { Article, CreateArticleInput, UpdateArticleInput } from "@/shared/types"

export const articleApi = {
  async getAll(): Promise<Article[]> {
    if (!isSupabaseConfigured || !supabase) {
      return mockBackend.getArticles()
    }

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Supabase articles error, falling back to mock:", error)
      return mockBackend.getArticles()
    }

    return data as Article[]
  },

  async getById(id: string): Promise<Article | null> {
    if (!isSupabaseConfigured || !supabase) {
      return mockBackend.getArticleById(id)
    }

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      console.error("Error fetching article:", error)
      return mockBackend.getArticleById(id)
    }

    return (data as Article) || null
  },

  async create(input: CreateArticleInput): Promise<Article> {
    if (!isSupabaseConfigured || !supabase) {
      return mockBackend.createArticle(input)
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: input.title,
        slug: input.slug,
        content: input.content || "",
        status: input.status || "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating article in Supabase, using mock fallback:", error)
      return mockBackend.createArticle(input)
    }

    return data as Article
  },

  async update(id: string, input: UpdateArticleInput): Promise<Article> {
    if (!isSupabaseConfigured || !supabase) {
      return mockBackend.updateArticle(id, input)
    }

    const { data, error } = await supabase
      .from("articles")
      .update(input)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating article in Supabase, using mock fallback:", error)
      return mockBackend.updateArticle(id, input)
    }

    return data as Article
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return mockBackend.deleteArticle(id)
    }

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting article in Supabase, using mock fallback:", error)
      return mockBackend.deleteArticle(id)
    }
  },
}
