import { useInfiniteQuery } from "@tanstack/react-query"
import { supabase, isSupabaseConfigured, mockBackend } from "@/shared/api/supabase"
import type { CursorPaginatedMessages, Message } from "@/shared/types"

const PAGE_SIZE = 25

export function useInfiniteMessages(clientId?: number) {
  return useInfiniteQuery<CursorPaginatedMessages>({
    queryKey: ["messages", clientId],
    queryFn: async ({ pageParam }) => {
      if (!clientId) {
        return { messages: [], nextCursor: null, hasMore: false }
      }

      const cursor = pageParam as string | null

      // Fallback на mockBackend, если Supabase не сконфигурирован
      if (!isSupabaseConfigured || !supabase) {
        return mockBackend.getMessages(clientId, cursor, PAGE_SIZE)
      }

      try {
        let query = supabase
          .from("messages")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }) // Запрашиваем сначала более новые от курсора
          .limit(PAGE_SIZE)

        if (cursor) {
          query = query.lt("created_at", cursor)
        }

        const { data, error } = await query

        if (error) {
          console.warn("Supabase messages query error, fallback to mock:", error)
          return mockBackend.getMessages(clientId, cursor, PAGE_SIZE)
        }

        const rawMessages = (data || []) as Message[]
        // Переворачиваем в хронологический порядок для рендера (старые сверху, новые снизу)
        const sortedAsc = [...rawMessages].reverse()
        const hasMore = rawMessages.length === PAGE_SIZE
        const nextCursor = hasMore && sortedAsc.length > 0 ? sortedAsc[0].created_at : null

        return {
          messages: sortedAsc,
          nextCursor,
          hasMore,
        }
      } catch (err) {
        console.warn("Supabase fetch exception, fallback to mock:", err)
        return mockBackend.getMessages(clientId, cursor, PAGE_SIZE)
      }
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      // Для TanStack Query getNextPageParam возвращает курсор для подгрузки предыдущих (более старых) сообщений
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    enabled: Boolean(clientId),
  })
}
