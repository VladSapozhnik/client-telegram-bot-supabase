import { useState, useMemo } from "react"
import { Search, Users, Wifi, AlertCircle, Bot, Sparkles } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Skeleton } from "@/shared/ui/skeleton"
import { Badge } from "@/shared/ui/badge"
import { useClients, useClientsRealtime, ClientCard } from "@/entities/client"
import { isSupabaseConfigured } from "@/shared/api/supabase"
import type { Client } from "@/shared/types"

interface ClientListProps {
  selectedClientId?: number
  onSelectClient: (client: Client) => void
}

export function ClientList({ selectedClientId, onSelectClient }: ClientListProps) {
  const [search, setSearch] = useState("")
  const { data: clients, isLoading, isError } = useClients()

  // Реалтайм-подписка на появление новых клиентов и обновление статусов
  useClientsRealtime()

  const filteredClients = useMemo(() => {
    if (!clients) return []
    if (!search.trim()) return clients

    const query = search.toLowerCase()
    return clients.filter((c) => {
      const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase()
      const username = (c.username || "").toLowerCase()
      const id = String(c.id)
      return name.includes(query) || username.includes(query) || id.includes(query)
    })
  }, [clients, search])

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-white/5 bg-slate-950/70 backdrop-blur-2xl z-10 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Telegram CRM
                <Sparkles className="w-3 h-3 text-blue-400" />
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Диалоги с клиентами</p>
            </div>
          </div>

          <div className="flex items-center">
            {isSupabaseConfigured ? (
              <Badge variant="success" className="gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                Live Cloud
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <AlertCircle className="w-3 h-3" />
                Demo
              </Badge>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, @username или ID..."
            className="pl-10 h-10 rounded-xl bg-slate-900/40 border-white/5 text-xs placeholder:text-slate-500 text-slate-200 focus:border-blue-500/40"
          />
        </div>
      </div>

      {/* Counter subheader */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          Все клиенты
        </span>
        <span className="bg-slate-900/80 border border-white/5 px-2 py-0.5 rounded-md text-slate-300 font-mono text-[10px]">
          {clients ? clients.length : 0}
        </span>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="p-2 space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/30 border border-white/5">
                <Skeleton className="w-11 h-11 rounded-2xl bg-slate-800/60" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded bg-slate-800/60" />
                  <Skeleton className="h-3 w-1/2 rounded bg-slate-800/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="p-6 text-center text-sm text-rose-400 bg-rose-950/20 rounded-xl border border-rose-900/30 m-2">
            Ошибка загрузки клиентов
          </div>
        )}

        {!isLoading && filteredClients.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            {search ? "Ничего не найдено" : "Нет клиентов"}
          </div>
        )}

        {!isLoading &&
          filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isSelected={client.id === selectedClientId}
              onClick={() => onSelectClient(client)}
            />
          ))}
      </div>
    </aside>
  )
}
