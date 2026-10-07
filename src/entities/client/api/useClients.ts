import { useQuery } from "@tanstack/react-query"
import { supabase, isSupabaseConfigured, mockBackend } from "@/shared/api/supabase"
import type { Client } from "@/shared/types"

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        return mockBackend.getClients()
      }

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("last_activity_at", { ascending: false })

      if (error) {
        console.warn("Supabase clients query error, falling back to mock:", error)
        return mockBackend.getClients()
      }

      return (data || []) as Client[]
    },
    refetchInterval: 10000, // периодически обновляем статус активности
  })
}
