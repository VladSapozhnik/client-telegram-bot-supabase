import React, { useState } from "react"
import { Send, CornerDownLeft } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { useSendMessage } from "@/entities/message"

interface SendMessageFormProps {
  clientId: number
}

export function SendMessageForm({ clientId }: SendMessageFormProps) {
  const [text, setText] = useState("")
  const { mutate: sendMessage, isPending } = useSendMessage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isPending) return

    sendMessage(
      {
        clientId,
        text: text.trim(),
        sender: "bot",
      },
      {
        onSuccess: () => {
          setText("")
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-slate-950/70 backdrop-blur-2xl border-t border-white/5 flex flex-col gap-2.5 z-10"
    >
      <div className="flex items-center gap-2.5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите ответ клиенту в Telegram..."
          disabled={isPending}
          className="flex-1 rounded-xl bg-slate-900/60 border-white/10 focus:border-blue-500/60 focus:bg-slate-900/90 text-slate-100 placeholder:text-slate-500 h-11 px-4 text-sm"
        />
        <Button
          type="submit"
          disabled={!text.trim() || isPending}
          size="icon"
          className="rounded-xl h-11 w-11 shrink-0"
          title="Отправить в Telegram"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
        <span>Сообщение будет отправлено в Telegram-чат клиента</span>
        <span className="hidden sm:flex items-center gap-1">
          <span>Enter для отправки</span>
          <CornerDownLeft className="w-3 h-3 text-slate-400" />
        </span>
      </div>
    </form>
  )
}
