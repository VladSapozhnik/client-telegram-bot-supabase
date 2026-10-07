import React from "react"
import { ArticleManagerWidget } from "@/widgets/article-manager"
import { Link } from "@tanstack/react-router"
import { MessageSquare, FileText } from "lucide-react"

export function ArticlesPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased selection:bg-blue-600/30">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      {/* Main navigation sidebar / rail */}
      <aside className="relative z-10 w-16 border-r border-slate-800/80 bg-slate-900/60 flex flex-col items-center py-5 gap-6 select-none shrink-0">
        <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
          VB
        </div>

        <nav className="flex flex-col gap-3">
          <Link
            to="/"
            title="Чаты"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>
          <Link
            to="/articles"
            title="Статьи"
            className="p-3 rounded-xl text-blue-400 bg-blue-600/10 border border-blue-500/20 transition-all"
          >
            <FileText className="h-5 w-5" />
          </Link>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <ArticleManagerWidget />
      </main>
    </div>
  )
}
