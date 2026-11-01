import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { AppShell } from "~/components/app-sidebar/AppShell";
import { getSidebarDefaultOpen } from "~/data-access-layer/sidebar";

export const Route = createFileRoute("/(dashboard)")({
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
