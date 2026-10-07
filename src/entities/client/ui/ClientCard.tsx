import { Avatar } from "@/shared/ui/avatar"
import { formatActivityDate } from "@/shared/lib/formatDate"
import { cn } from "@/shared/lib/utils"
import type { Client } from "@/shared/types"

interface ClientCardProps {
  client: Client
  isSelected?: boolean
  onClick?: () => void
}

export function ClientCard({ client, isSelected, onClick }: ClientCardProps) {
  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || `Пользователь #${client.id}`
  const usernameText = client.username ? `@${client.username}` : `ID: ${client.id}`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        "group relative flex items-center gap-3.5 w-full p-3 rounded-2xl transition-all duration-200 cursor-pointer text-left select-none border",
        isSelected
          ? "bg-blue-600/15 border-blue-500/30 shadow-lg shadow-blue-950/40"
          : "border-transparent hover:bg-white/[0.04] hover:border-white/5"
      )}
    >
      {/* Active accent pill indicator on the left */}
      {isSelected && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
      )}

      <div className="relative shrink-0">
        <Avatar name={fullName} size="md" />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className={cn(
            "font-semibold text-sm truncate tracking-tight transition-colors",
            isSelected ? "text-blue-400" : "text-slate-200 group-hover:text-white"
          )}>
            {fullName}
          </span>
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
            {formatActivityDate(client.last_activity_at)}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 font-mono">
          <span>{usernameText}</span>
        </p>
      </div>
    </div>
  )
}
