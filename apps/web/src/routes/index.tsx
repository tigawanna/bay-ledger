import { createFileRoute, redirect } from "@tanstack/solid-router";
import { getAuthSession } from "~/lib/auth/session";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (getAuthSession()) {
      throw redirect({ to: "/messages" });
    }
    throw redirect({ to: "/sign-in" });
  },
});
