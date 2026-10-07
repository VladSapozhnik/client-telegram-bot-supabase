import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase, isSupabaseConfigured } from "@/shared/api/supabase"
import type { Client } from "@/shared/types"

/**
 * Хук реалтайм-подписки на изменения таблицы clients (новые клиенты, смена last_activity_at, апдейты профиля)
 */
export function useClientsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    const channel = supabase
      .channel("public-clients-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "clients",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newClient = payload.new as Client
            queryClient.setQueryData<Client[]>(["clients"], (old = []) => {
              if (old.some((c) => c.id === newClient.id)) return old
              return [newClient, ...old].sort(
                (a, b) =>
                  new Date(b.last_activity_at).getTime() -
                  new Date(a.last_activity_at).getTime()
              )
            })
          } else if (payload.eventType === "UPDATE") {
            const updatedClient = payload.new as Client
            queryClient.setQueryData<Client[]>(["clients"], (old = []) => {
              const updated = old.map((c) => {
                if (c.id !== updatedClient.id) return c
                return {
                  ...c,
                  ...updatedClient,
                  first_name: updatedClient.first_name ?? c.first_name,
                  last_name: updatedClient.last_name ?? c.last_name,
                  username: updatedClient.username ?? c.username,
                }
              })
              return updated.sort(
                (a, b) =>
                  new Date(b.last_activity_at).getTime() -
                  new Date(a.last_activity_at).getTime()
              )
            })
          } else if (payload.eventType === "DELETE") {
            const oldClient = payload.old as { id: number }
            queryClient.setQueryData<Client[]>(["clients"], (old = []) =>
              old.filter((c) => c.id !== oldClient.id)
            )
          }

          // Дополнительно инвалидируем на случай расхождения
          queryClient.invalidateQueries({ queryKey: ["clients"] })
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Supabase Realtime] Subscribed to clients table updates")
        }
      })

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [queryClient])
}
