import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { articleApi } from "./articleApi"
import type { CreateArticleInput, UpdateArticleInput } from "@/shared/types"

export const ARTICLE_KEYS = {
  all: ["articles"] as const,
  detail: (id: string) => ["articles", id] as const,
}

export function useArticles() {
  return useQuery({
    queryKey: ARTICLE_KEYS.all,
    queryFn: () => articleApi.getAll(),
  })
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ARTICLE_KEYS.detail(id || ""),
    queryFn: () => (id ? articleApi.getById(id) : null),
    enabled: Boolean(id),
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateArticleInput) => articleApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLE_KEYS.all })
    },
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateArticleInput }) =>
      articleApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ARTICLE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ARTICLE_KEYS.detail(variables.id) })
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => articleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLE_KEYS.all })
    },
  })
}
