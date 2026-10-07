import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, isSupabaseConfigured, mockBackend } from "@/shared/api/supabase"
import type { Message } from "@/shared/types"

interface SendMessageVariables {
  clientId: number
  text: string
  sender?: "client" | "bot"
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation<Message, Error, SendMessageVariables>({
    mutationFn: async ({ clientId, text, sender = "bot" }) => {
      if (!isSupabaseConfigured || !supabase) {
        return mockBackend.sendMessage(clientId, sender, text)
      }

      // Вызываем Edge Function send-message, которая отправляет в Telegram (если sender === 'bot') и сохраняет в БД
      const { data, error } = await supabase.functions.invoke("send-message", {
        body: {
          clientId,
          text: text.trim(),
          sender,
        },
      })

      if (error) {
        console.error("Error calling send-message Edge Function, fallback to direct insert:", error)
        // Fallback: прямая вставка в таблицу, если функция дала сбой
        const { data: insertData, error: insertError } = await supabase
          .from("messages")
          .insert({
            client_id: clientId,
            sender,
            text,
          })
          .select()
          .single()

        if (insertError) {
          throw new Error(insertError.message)
        }

        return insertData as Message
      }

      return {
        id: Date.now(),
        client_id: clientId,
        sender,
        text,
        created_at: new Date().toISOString(),
      } as Message
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.clientId] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}
