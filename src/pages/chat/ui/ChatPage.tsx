import { useMemo } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ClientList } from "@/widgets/client-list/ui/ClientList"
import { ChatArea } from "@/widgets/chat-area/ui/ChatArea"
import { useClients } from "@/entities/client"

export function ChatPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { clientId?: string }
  const selectedId = params.clientId ? Number(params.clientId) : undefined

  const { data: clients } = useClients()

  const selectedClient = useMemo(() => {
    if (!selectedId || !clients) return undefined
    return clients.find((c) => c.id === selectedId)
  }, [clients, selectedId])

  const handleSelectClient = (client: { id: number }) => {
    navigate({
      to: "/client/$clientId",
      params: { clientId: String(client.id) },
    })
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased selection:bg-blue-600/30">
      {/* Background subtle mesh glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      <div className="relative z-10 flex h-full w-full">
        <ClientList
          selectedClientId={selectedId}
          onSelectClient={handleSelectClient}
        />
        <ChatArea client={selectedClient} />
      </div>
    </div>
  )
}
