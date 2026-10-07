import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import { ru } from "date-fns/locale"

export function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return format(date, "HH:mm")
  } catch {
    return ""
  }
}

export function formatActivityDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, "HH:mm")
    }
    if (isYesterday(date)) {
      return "Вчера"
    }
    return format(date, "d MMM", { locale: ru })
  } catch {
    return ""
  }
}

export function formatRelativeActivity(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ru,
    })
  } catch {
    return ""
  }
}
