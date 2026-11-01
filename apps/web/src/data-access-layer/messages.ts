import { createServerFn } from "@tanstack/solid-start";

export const getMessages = createServerFn().handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 6000));
  return [
    {
      id: "1",
      content: "Hello, world! 1",
    },
    {
      id: "2",
      content: "Hello, world! 2",
    },
    {
      id: "3",
      content: "Hello, world! 3",
    },
  ];
});
