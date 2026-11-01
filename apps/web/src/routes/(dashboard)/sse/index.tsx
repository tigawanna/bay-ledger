import { createSSE, json, SSEReadyState } from "@solid-primitives/sse";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createSignal, For, on, Show } from "solid-js";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { SSE_PATH } from "~/data-access-layer/sse";
import { type SsePayload } from "./api.events";

export const Route = createFileRoute("/(dashboard)/sse/")({
  component: RouteComponent,
});

function connectionLabel(state: number) {
  if (state === SSEReadyState.OPEN) return "Open";
  if (state === SSEReadyState.CONNECTING) return "Connecting";
  return "Closed";
}

function RouteComponent() {
  const { data, close, reconnect, readyState } = createSSE<SsePayload>(SSE_PATH, {
    transform: json<SsePayload>,
  });
  const [messages, setMessages] = createSignal<SsePayload[]>([]);

  createEffect(
    on(data, (next) => {
      if (!next) return;

      setMessages((prev) => {
        if (prev.at(-1)?.id === next.id) return prev;
        return [...prev, next];
      });
    }),
  );

  const isOpen = () => readyState() === SSEReadyState.OPEN;
  const isClosed = () => readyState() === SSEReadyState.CLOSED;

  return (
    <div class="flex min-h-screen h-full w-full flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <ButtonGroup>
          <Button variant="outline" size="sm" onClick={() => setMessages([])}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={() => close()}>
            Disconnect
          </Button>
          <Button variant="outline" size="sm" onClick={() => reconnect()}>
            Reconnect
          </Button>
        </ButtonGroup>
        <Badge variant={isOpen() ? "default" : "secondary"}>{connectionLabel(readyState())}</Badge>
      </div>
      <Show
        when={messages().length > 0}
        fallback={<p>{isClosed() ? "Disconnected." : "Waiting for events…"}</p>}
      >
        <For each={messages()}>
          {(message) => (
            <div class="w-full flex flex-col items-center justify-center">{message.content}</div>
          )}
        </For>
      </Show>
    </div>
  );
}
