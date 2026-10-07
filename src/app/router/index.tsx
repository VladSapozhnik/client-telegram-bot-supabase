import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router"
import { ChatPage } from "@/pages/chat/ui/ChatPage"
import { ArticlesPage } from "@/pages/articles/ui/ArticlesPage"

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ChatPage,
})

// Client detail route
const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client/$clientId",
  component: ChatPage,
})

// Articles route
const articlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/articles",
  component: ArticlesPage,
})

const routeTree = rootRoute.addChildren([indexRoute, clientRoute, articlesRoute])

const basepath = import.meta.env.BASE_URL || "/"

export const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
