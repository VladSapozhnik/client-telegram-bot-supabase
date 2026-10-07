import { useEffect, useRef, useCallback } from "react"

interface UseChatScrollOptions {
  onLoadMoreTop?: () => void
  hasMoreTop?: boolean
  isLoadingTop?: boolean
  messagesCount: number
}

export function useChatScroll({
  onLoadMoreTop,
  hasMoreTop,
  isLoadingTop,
  messagesCount,
}: UseChatScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isInitialScrollDoneRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const isNearBottomRef = useRef(true)

  // Прокрутка в самый низ (к свежим сообщениям)
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      })
    }
  }, [])

  // 1. Первая инициализация: скроллим вниз сразу после первой порции данных
  useEffect(() => {
    if (messagesCount > 0 && !isInitialScrollDoneRef.current) {
      scrollToBottom("instant")
      isInitialScrollDoneRef.current = true
    }
  }, [messagesCount, scrollToBottom])

  // 2. Корректировка скролла после подгрузки старых сообщений сверху (чтобы не прыгал экран)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (prevScrollHeightRef.current > 0) {
      const addedHeight = el.scrollHeight - prevScrollHeightRef.current
      if (addedHeight > 0) {
        el.scrollTop = el.scrollTop + addedHeight
      }
      prevScrollHeightRef.current = 0
    }
  }, [messagesCount])

  // 3. Отслеживание скролла: детекция достижения верха для подгрузки предыдущих сообщений
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    isNearBottomRef.current = distanceFromBottom < 80

    // Если прокрутили близко к верху (меньше 100px) и есть что подгружать
    if (el.scrollTop < 100 && hasMoreTop && !isLoadingTop && onLoadMoreTop) {
      prevScrollHeightRef.current = el.scrollHeight
      onLoadMoreTop()
    }
  }, [hasMoreTop, isLoadingTop, onLoadMoreTop])

  // 4. Если пришло новое сообщение снизу и пользователь был внизу - автоскроллим
  useEffect(() => {
    if (isInitialScrollDoneRef.current && isNearBottomRef.current) {
      scrollToBottom("smooth")
    }
  }, [messagesCount, scrollToBottom])

  // Сброс при смене клиента
  const resetScroll = useCallback(() => {
    isInitialScrollDoneRef.current = false
    prevScrollHeightRef.current = 0
    isNearBottomRef.current = true
  }, [])

  return {
    containerRef,
    handleScroll,
    scrollToBottom,
    resetScroll,
  }
}
