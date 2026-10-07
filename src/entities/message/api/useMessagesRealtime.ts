import { useEffect } from "react"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { supabase, isSupabaseConfigured, mockBackend } from "@/shared/api/supabase"
import type { Message, CursorPaginatedMessages } from "@/shared/types"

export function useMessagesRealtime(clientId?: number) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!clientId) return

    // Функция добавления нового сообщения в кэш InfiniteQuery (в самый конец последней страницы)
    const handleNewMessage = (newMessage: Message) => {
      if (Number(newMessage.client_id) !== Number(clientId)) return

      queryClient.setQueryData<InfiniteData<CursorPaginatedMessages>>(
        ["messages", clientId],
        (oldData) => {
          if (!oldData) return oldData

          const lastPageIndex = oldData.pages.length - 1
          const lastPage = oldData.pages[lastPageIndex]

          // Проверяем, нет ли уже такого сообщения
          const exists = oldData.pages.some((page) =>
            page.messages.some((m) => m.id === newMessage.id)
          )
          if (exists) return oldData

          const updatedLastPage = {
            ...lastPage,
            messages: [...lastPage.messages, newMessage],
          }

          const updatedPages = [...oldData.pages]
          updatedPages[lastPageIndex] = updatedLastPage

          return {
            ...oldData,
            pages: updatedPages,
          }
        }
      )

      // Также обновляем список клиентов (чтобы поднялся наверх по last_activity_at)
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    }

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`client-messages-${clientId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `client_id=eq.${clientId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message
            handleNewMessage(newMsg)
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`[Supabase Realtime] Subscribed to messages for client ${clientId}`)
          }
        })

      return () => {
        if (supabase) {
          supabase.removeChannel(channel)
        }
      }
    } else {
      // Подписка на локальный мок эмиттер
      const unsubscribe = mockBackend.subscribe(handleNewMessage)
      return () => {
        unsubscribe()
      }
    }
  }, [clientId, queryClient])
}
