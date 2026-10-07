import { formatMessageTime } from "@/shared/lib/formatDate"
import { cn } from "@/shared/lib/utils"
import { CheckCheck } from "lucide-react"
import type { Message } from "@/shared/types"

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const isBot = message.sender === "bot"

  return (
    <div
      className={cn(
        "flex w-full my-1.5 transition-all duration-200 group",
        isBot ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md relative text-sm leading-relaxed transition-transform duration-100",
          isBot
            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-blue-950/30 border border-blue-400/20"
            : "bg-slate-800/80 backdrop-blur-md text-slate-100 border border-slate-700/60 rounded-bl-xs shadow-black/20"
        )}
      >
        <p className="whitespace-pre-wrap break-words select-text font-normal">{message.text}</p>
        <div
          className={cn(
            "text-[10.5px] mt-1 flex items-center justify-end gap-1 select-none font-medium",
            isBot ? "text-blue-200/90" : "text-slate-400"
          )}
        >
          <span>{formatMessageTime(message.created_at)}</span>
          {isBot && (
            <CheckCheck className="w-3.5 h-3.5 text-blue-200 inline" />
          )}
        </div>
      </div>
    </div>
  )
}
