import { useEffect } from "react"
import { MessageSquare, Loader2, ArrowDown, Sparkles, Send } from "lucide-react"
import { Avatar } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { formatRelativeActivity } from "@/shared/lib/formatDate"
import { useInfiniteMessages, useMessagesRealtime, MessageItem } from "@/entities/message"
import { useChatScroll } from "@/features/chat-scroll/useChatScroll"
import { SendMessageForm } from "@/features/send-message/ui/SendMessageForm"
import type { Client } from "@/shared/types"

interface ChatAreaProps {
  client?: Client
}

export function ChatArea({ client }: ChatAreaProps) {
  const clientId = client?.id

  // Подписка на реалтайм сообщения
  useMessagesRealtime(clientId)

  // Курсорная пагинация TanStack Query
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMessages(clientId)

  // Объединяем сообщения со всех подгруженных страниц в один линейный массив
  const allMessages = data?.pages.flatMap((page) => page.messages) || []

  // Хук курсорного скролла: сохраняет позицию при скролле вверх, автоскроллит вниз при новых сообщениях
  const {
    containerRef,
    handleScroll,
    scrollToBottom,
    resetScroll,
  } = useChatScroll({
    messagesCount: allMessages.length,
    hasMoreTop: Boolean(hasNextPage),
    isLoadingTop: isFetchingNextPage,
    onLoadMoreTop: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
  })

  // Сброс состояния скролла при смене собеседника
  useEffect(() => {
    resetScroll()
  }, [clientId, resetScroll])

  if (!client) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent text-center relative select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-white/5 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-950/50">
            <MessageSquare className="w-9 h-9" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          Выберите диалог
        </h3>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
          Выберите клиента из списка слева, чтобы просматривать переписку в реальном времени и отправлять ответы.
        </p>
      </main>
    )
  }

  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || `Пользователь #${client.id}`
  const usernameText = client.username ? `@${client.username}` : `ID: ${client.id}`

  return (
    <main className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-slate-950/60 backdrop-blur-2xl px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          <Avatar name={fullName} size="md" />
          <div>
            <h2 className="font-semibold text-sm text-white leading-tight flex items-center gap-2">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="text-blue-400 font-mono font-medium">{usernameText}</span>
              <span className="text-slate-600">•</span>
              <span>
                активность: {formatRelativeActivity(client.last_activity_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-white/5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Онлайн в Telegram
          </span>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col scroll-smooth space-y-1.5"
      >
        {/* Индикатор подгрузки старых сообщений сверху */}
        <div className="w-full flex justify-center py-2 min-h-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-lg border border-white/10">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Загрузка предыдущих сообщений...</span>
            </div>
          )}
          {!hasNextPage && allMessages.length > 0 && !isLoading && (
            <span className="text-[11px] font-medium text-slate-500 select-none bg-slate-900/60 px-3.5 py-1 rounded-full border border-white/5">
              Начало истории переписки
            </span>
          )}
        </div>

        {/* Скелетоны первой загрузки */}
        {isLoading && (
          <div className="space-y-4 py-8 max-w-lg mx-auto w-full">
            <Skeleton className="h-12 w-2/3 rounded-2xl bg-slate-900/60 border border-white/5" />
            <Skeleton className="h-12 w-1/2 ml-auto rounded-2xl bg-slate-900/60 border border-white/5" />
            <Skeleton className="h-16 w-3/4 rounded-2xl bg-slate-900/60 border border-white/5" />
            <Skeleton className="h-10 w-1/3 ml-auto rounded-2xl bg-slate-900/60 border border-white/5" />
          </div>
        )}

        {/* Пустая история */}
        {!isLoading && allMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 mb-2">
              <Send className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-300">Сообщений пока нет</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Напишите первое сообщение клиенту снизу.
            </p>
          </div>
        )}

        {/* Сообщения: от старых (сверху) к свежим (снизу) */}
        {!isLoading &&
          allMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
      </div>

      {/* Кнопка быстрой прокрутки вниз */}
      <div className="absolute right-6 bottom-24 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollToBottom("smooth")}
          className="rounded-full shadow-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/10 backdrop-blur-xl cursor-pointer hover:scale-105 transition-all"
          title="Вниз к новым сообщениям"
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Input Form */}
      <SendMessageForm clientId={client.id} />
    </main>
  )
}
