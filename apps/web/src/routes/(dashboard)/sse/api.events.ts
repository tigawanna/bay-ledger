import { createFileRoute } from "@tanstack/solid-router";
import { createResponse } from "better-sse";

export type SsePayload = {
  id: number;
  content: string;
};

export const SSE_PATH = "/sse/api/events";

export const Route = createFileRoute("/(dashboard)/sse/api/events")({
  server: {
    handlers: {
      GET: ({ request }) =>
        createResponse(request, (session) => {
          let id = 0;

          const send = (payload: SsePayload) => {
            session.push(payload);
          };

          send({ id: ++id, content: "Hello, world!" });

          const interval = setInterval(() => {
            send({ id: ++id, content: `Hello, world! ${id}` });
          }, 1000);

          session.on("disconnected", () => {
            clearInterval(interval);
          });
        }),
    },
  },
});
