import { TanStackDevtools } from "@tanstack/solid-devtools";
import { formDevtoolsPlugin } from "@tanstack/solid-form-devtools";
import { pacerDevtoolsPlugin } from "@tanstack/solid-pacer-devtools";
import { SolidQueryDevtoolsPanel } from "@tanstack/solid-query-devtools";
import type { AnyRouter } from "@tanstack/solid-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/solid-router-devtools";
import type { QueryClient } from "@tanstack/solid-query";

export default function TanstackDevtools(props: { router: AnyRouter; queryClient: QueryClient }) {
  return (
    <TanStackDevtools
      config={{
        position: "middle-right",
      }}
      eventBusConfig={{
        connectToServerBus: true,
      }}
      plugins={[
        {
          name: "TanStack Query",
          render: () => <SolidQueryDevtoolsPanel client={props.queryClient} />,
        },
        {
          name: "TanStack Router",
          render: () => <TanStackRouterDevtoolsPanel router={props.router} />,
        },
        formDevtoolsPlugin(),
        pacerDevtoolsPlugin(),
      ]}
    />
  );
}
