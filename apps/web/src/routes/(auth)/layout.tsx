import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router";
import { getAuthSession } from "~/lib/auth/session";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: () => {
    if (getAuthSession()) {
      throw redirect({ to: "/messages" });
    }
  },
  component: () => <Outlet />,
});
