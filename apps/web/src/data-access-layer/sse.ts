export type SsePayload = {
  id: number;
  content: string;
};

export const SSE_PATH = "/sse/api/events";
