import React, { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import type { Article, CreateArticleInput, ArticleStatus } from "@/shared/types"

interface ArticleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateArticleInput) => Promise<void>
  initialData?: Article | null
  isLoading?: boolean
}

export function ArticleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: ArticleFormModalProps) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<ArticleStatus>("draft")

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setSlug(initialData.slug)
      setContent(initialData.content)
      setStatus(initialData.status)
    } else {
      setTitle("")
      setSlug("")
      setContent("")
      setStatus("draft")
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!initialData) {
      // Auto-generate slug for new articles
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(generated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return

    await onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      content,
      status,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              {initialData ? "Редактировать статью" : "Создать новую статью"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Заголовок статьи <span className="text-rose-400">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Например: Обзор курсов валют"
              required
              className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              URL Slug (идентификатор) <span className="text-rose-400">*</span>
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="obzor-kursov-valyut"
              required
              className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Статус публикации
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="draft">Черновик (Draft)</option>
                <option value="published">Опубликовано (Published)</option>
                <option value="archived">В архиве (Archived)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Содержимое статьи (Markdown / Plain Text)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Текст статьи..."
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !slug.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            >
              {isLoading ? "Сохранение..." : initialData ? "Обновить статью" : "Создать статью"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
