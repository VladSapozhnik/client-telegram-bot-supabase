import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router"
import { ChatPage } from "@/pages/chat/ui/ChatPage"

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

const routeTree = rootRoute.addChildren([indexRoute, clientRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
