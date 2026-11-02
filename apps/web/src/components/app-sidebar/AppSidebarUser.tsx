import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "@tanstack/solid-router";
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from "solid-icons/fi";
import { Show } from "solid-js";
import { signOutCrew } from "~/lib/auth/cognito";
import { displayName, initials, resolveAuthSession } from "~/lib/auth/session";
import { cx } from "~/lib/styling/cva";

export function AppSidebarUser() {
  const navigate = useNavigate();
  const { isMobile, state } = useSidebar();
  const session = resolveAuthSession();
  const name = displayName(session);
  const email = session?.email ?? session?.username ?? "";
  const letters = initials(session);
  const expanded = () => state() === "expanded" || isMobile();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu placement={isMobile() ? "top" : "right-end"}>
          <DropdownMenuTrigger
            as={SidebarMenuButton}
            size="lg"
            tooltip={name}
            class="data-[expanded]:bg-sidebar-accent data-[expanded]:text-sidebar-accent-foreground w-full active:scale-[0.97] transition-transform duration-160 ease-out"
          >
            <span
              class={cx(
                "bg-sidebar-accent text-sidebar-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tracking-wide",
                "group-data-[collapsible=icon]:size-8",
              )}
              aria-hidden
            >
              {letters}
            </span>
            <Show when={expanded()}>
              <span class="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{name}</span>
                <span class="text-muted-foreground truncate text-xs">{email}</span>
              </span>
              <FiChevronDown class="ml-auto size-4 opacity-70" />
            </Show>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent class="min-w-56 rounded-lg">
              <DropdownMenuGroup>
                <DropdownMenuGroupLabel class="p-0 font-normal">
                  <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <span class="bg-sidebar-accent flex size-8 items-center justify-center rounded-lg text-xs font-semibold">
                      {letters}
                    </span>
                    <span class="grid min-w-0 flex-1 leading-tight">
                      <span class="truncate font-medium">{name}</span>
                      <span class="text-muted-foreground truncate text-xs">{email}</span>
                    </span>
                  </div>
                </DropdownMenuGroupLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => void navigate({ to: "/profile" })}>
                  <FiUser />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void navigate({ to: "/settings" })}>
                  <FiSettings />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  void (async () => {
                    await signOutCrew();
                    await navigate({ to: "/sign-in" });
                  })();
                }}
              >
                <FiLogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
