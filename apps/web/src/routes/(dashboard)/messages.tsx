import { queryOptions, useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { ErrorTemplate } from "~/components/error/ErrorTemplate";
import { getMessages } from "~/data-access-layer/messages";
import { RouterPendingComponent } from "~/lib/tanstack/router/RouterPendingComponent";

const messagesQueryOptions = queryOptions({
  queryKey: ["messages"],
  queryFn: getMessages,
});

export const Route = createFileRoute("/(dashboard)/messages")({
  loader: ({ context }) => context.queryClient.query(messagesQueryOptions),
  component: PageComponent,
  pendingComponent: () => (
    <div class="flex flex-col gap-4 h-full">
      <RouterPendingComponent />
    </div>
  ),
});
import { For, Match, Switch } from "solid-js";

function PageComponent() {
  const messagesQuery = useQuery(() => messagesQueryOptions);

  return (
    <div class="flex flex-col gap-4 min-h-screen h-full w-full">
      <Switch>
        <Match when={messagesQuery.isPending}>
          <div class="flex flex-col gap-4 h-full">
            <RouterPendingComponent />
          </div>
        </Match>
        <Match when={messagesQuery.isError}>
          <ErrorTemplate error={messagesQuery.error} onRetry={() => void messagesQuery.refetch()} />
        </Match>
        <Match when={messagesQuery.isSuccess}>
          <div class="flex flex-col gap-4 h-full">
            <For each={messagesQuery.data}>{(message) => <div>{message.content}</div>}</For>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
