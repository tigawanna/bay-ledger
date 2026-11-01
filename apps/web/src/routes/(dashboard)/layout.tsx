import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router";
import { AppShell } from "~/components/app-sidebar/AppShell";
import { getSidebarDefaultOpen } from "~/data-access-layer/sidebar";
import { getAuthSession } from "~/lib/auth/session";

export const Route = createFileRoute("/(dashboard)")({
  beforeLoad: ({ location }) => {
    if (!getAuthSession()) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.pathname },
      });
    }
  },
  loader: () => getSidebarDefaultOpen(),
  component: RouteComponent,
});

function RouteComponent() {
  const defaultOpen = Route.useLoaderData();

  return (
    <AppShell defaultOpen={defaultOpen()}>
      <Outlet />
    </AppShell>
  );
}
