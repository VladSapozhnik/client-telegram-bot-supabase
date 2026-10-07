import React, { useState } from "react"
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react"
import {
  useArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from "@/entities/article"
import { ArticleFormModal } from "@/features/article-crud"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import type { Article, ArticleStatus, CreateArticleInput } from "@/shared/types"

export function ArticleManagerWidget() {
  const { data: articles, isLoading } = useArticles()
  const createMutation = useCreateArticle()
  const updateMutation = useUpdateArticle()
  const deleteMutation = useDeleteArticle()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)

  const filteredArticles = (articles || []).filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.slug.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ? true : article.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenCreate = () => {
    setEditingArticle(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: CreateArticleInput) => {
    if (editingArticle) {
      await updateMutation.mutateAsync({
        id: editingArticle.id,
        input: data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return
    await deleteMutation.mutateAsync(articleToDelete.id)
    setArticleToDelete(null)
  }

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Опубликовано
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Черновик
          </Badge>
        )
      case "archived":
        return (
          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
            В архиве
          </Badge>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-6 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Управление статьями
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            CRUD-интерфейс статей и базы знаний для бота через Supabase Edge Functions
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Добавить статью
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 py-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по заголовку или слагу..."
            className="pl-9 bg-slate-900/60 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Статус:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value="published">Опубликованные</option>
            <option value="draft">Черновики</option>
            <option value="archived">В архиве</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-900/30">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm">Загрузка статей...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2 p-4 text-center">
            <FileText className="h-10 w-10 text-slate-600 stroke-1" />
            <p className="text-base font-medium text-slate-300">Статьи не найдены</p>
            <p className="text-xs text-slate-500 max-w-sm">
              {search
                ? "Попробуйте изменить поисковый запрос или фильтр."
                : "Создайте свою первую статью, нажав кнопку «Добавить статью»."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 hover:bg-slate-800/30 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    {getStatusBadge(article.status)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2 font-mono">
                    <span className="text-slate-500">/{article.slug}</span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {article.content || "Без содержимого..."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(article)}
                    className="border-slate-800 hover:bg-slate-800 hover:text-blue-400 text-slate-300 gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Изменить</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setArticleToDelete(article)}
                    className="border-slate-800 hover:bg-rose-950/40 hover:border-rose-900/60 hover:text-rose-400 text-slate-400 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Удалить</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingArticle}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete confirmation dialog */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Удалить статью?</h3>
            <p className="text-sm text-slate-400 mt-2">
              Вы уверены, что хотите удалить статью «
              <span className="text-slate-200 font-medium">{articleToDelete.title}</span>
              »? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setArticleToDelete(null)}
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                {deleteMutation.isPending ? "Удаление..." : "Удалить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
