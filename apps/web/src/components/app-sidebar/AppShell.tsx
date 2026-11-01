import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TSRBreadCrumbs } from "@/lib/tanstack/router/TSRBreadCrumbs";
import { Link, Outlet, useNavigate } from "@tanstack/solid-router";
import { FiLogOut, FiMessageSquare, FiMonitor, FiMoon, FiServer, FiSun } from "solid-icons/fi";
import { Match, Switch, type JSX } from "solid-js";
import { useThemeContext, type Theme } from "~/components/theme/theme-provider";
import { signOutCrew } from "~/lib/auth/cognito";
import { getAuthSession } from "~/lib/auth/session";
import { Logo } from "../icon/logo";
import { SidebarLinks, type SidebarItem } from "./sidebar-links";

const sidebarRoutes: SidebarItem[] = [
  { title: "Messages", href: "/messages", icon: FiMessageSquare },
  { title: "SSE", href: "/sse", icon: FiServer },
];

export function AppShell(props: { children?: JSX.Element; defaultOpen?: boolean }) {
  return (
    <SidebarProvider defaultOpen={props.defaultOpen ?? true} class="h-svh overflow-hidden">
      <Sidebar collapsible="icon">
        <SidebarHeader class="w-full bg-primary/10 px-3 py-3">
          <Link to="/" class="w-full flex flex-row justify-center items-center">
            <Logo class="w-10 h-10" />
            <span class="truncate text-lg font-semibold tracking-wide group-data-[collapsible=icon]:hidden">
              Bayledger
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent class="bg-primary/10">
          <SidebarGroup>
            <SidebarGroupLabel class="text-sm font-semibold tracking-wide">
              Navigation
            </SidebarGroupLabel>
            <SidebarLinks links={sidebarRoutes} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter class="bg-primary/15">
          <SignOutControl />
          <ThemeControl />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset class="min-h-0">
        <header class="bg-background sticky top-0 z-30 flex h-10 px-4 items-center gap-2">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <TSRBreadCrumbs />
        </header>
        <div class="@container/main flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-auto p-6">
          {props.children ?? <Outlet />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function SignOutControl() {
  const navigate = useNavigate();
  const session = getAuthSession();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          class="w-full"
          tooltip="Sign out"
          onClick={async () => {
            await signOutCrew();
            await navigate({ to: "/sign-in" });
          }}
        >
          <FiLogOut class="size-4" />
          <span class="truncate group-data-[collapsible=icon]:hidden">
            {session?.username ?? "Sign out"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ThemeControl() {
  const { theme, setTheme } = useThemeContext();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu placement="top-start">
          <DropdownMenuTrigger as={SidebarMenuButton} tooltip="Theme" class="w-full">
            <Switch>
              <Match when={theme() === "dark"}>
                <FiMoon class="size-4" />
              </Match>
              <Match when={theme() === "light"}>
                <FiSun class="size-4" />
              </Match>
              <Match when={theme() === "system"}>
                <FiMonitor class="size-4" />
              </Match>
            </Switch>
            <span class="group-data-[collapsible=icon]:hidden">{themeLabels[theme()]}</span>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent class="min-w-40">
              <DropdownMenuRadioGroup
                value={theme()}
                onChange={(value) => setTheme(value as Theme)}
              >
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
