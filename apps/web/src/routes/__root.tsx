import { PacerProvider } from "@tanstack/solid-pacer";
import {
  ClientOnly,
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/solid-router";
import { Show, Suspense, lazy, type JSX } from "solid-js";
import { HydrationScript } from "solid-js/web";
import appCss from "../app.css?url";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "../components/theme/theme-provider";
import { RouterErrorComponent } from "../lib/tanstack/router/RouterErrorComponent";
import { RouterNotFoundComponent } from "../lib/tanstack/router/RouterNotFoundComponent";
import { RouterPendingComponent } from "../lib/tanstack/router/RouterPendingComponent";
import type { RouterContext } from "../router";

const TanstackDevtools = import.meta.env.DEV
  ? lazy(() => import("../lib/tanstack/devtools/devtools"))
  : () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bayledger" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  errorComponent: (props) => <RouterErrorComponent error={props.error} resetError={props.reset} />,
  notFoundComponent: () => <RouterNotFoundComponent />,
  pendingComponent: () => <RouterPendingComponent />,
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  const router = useRouter();
  const routeContext = Route.useRouteContext();

  return (
    <>
      <Outlet />
      <Show when={import.meta.env.DEV}>
        <ClientOnly>
          <TanstackDevtools router={router} queryClient={routeContext().queryClient} />
        </ClientOnly>
      </Show>
    </>
  );
}

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <ThemeProvider>
          <PacerProvider>
            <Suspense>{props.children}</Suspense>
          </PacerProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
