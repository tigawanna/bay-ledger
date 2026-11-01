import { QueryClient } from "@tanstack/solid-query";
import { createRouter } from "@tanstack/solid-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/solid-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export interface RouterContext {
  queryClient: QueryClient;
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
