import type { Client, Message } from "@/shared/types"

export const INITIAL_MOCK_CLIENTS: Client[] = [
  {
    id: 1001,
    first_name: "Александр",
    last_name: "Иванов",
    username: "alex_ivanov",
    last_activity_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 1002,
    first_name: "Елена",
    last_name: "Смирнова",
    username: "elena_smirnova",
    last_activity_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 1003,
    first_name: "Дмитрий",
    last_name: "Ковалев",
    username: "dmitry_koval",
    last_activity_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 1004,
    first_name: "Анна",
    last_name: "Кузнецова",
    username: "anya_kuznetsova",
    last_activity_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

// Генерируем 75 сообщений для клиента 1001 для проверки плавной курсорной пагинации
export function generateMockHistory(clientId: number): Message[] {
  const result: Message[] = []
  const now = Date.now()
  const baseCount = clientId === 1001 ? 60 : 15

  for (let i = baseCount; i >= 1; i--) {
    const isClient = i % 2 === 1
    const minutesAgo = i * 4
    result.push({
      id: 10000 + i,
      client_id: clientId,
      sender: isClient ? "client" : "bot",
      text: isClient
        ? `Сообщение #${i}: Здравствуйте! Интересует актуальный статус заказа или курс валюты.`
        : `Сообщение #${i}: Ответ бота: Запрос принят в обработку, информация обновлена.`,
      created_at: new Date(now - minutesAgo * 60 * 1000).toISOString(),
    })
  }

  // Сортировка по возрастанию created_at (хронологический порядок)
  return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}
