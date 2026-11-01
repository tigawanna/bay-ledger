import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/solid-router";
import { FiChevronRight } from "solid-icons/fi";
import { For, Show, type Component, type JSX } from "solid-js";

export type SidebarItem = {
  title: string;
  href: string;
  icon?: Component<{ class?: string }>;
  sublinks?: SidebarItem[];
};

function normalizeSidebarPath(path: string): string {
  const base = path.split("?")[0] ?? "";
  if (base.length > 1 && base.endsWith("/")) return base.slice(0, -1);
  return base || "/";
}

function sidebarHrefMatchesPathname(pathname: string, href: string, fuzzy: boolean): boolean {
  const p = normalizeSidebarPath(pathname);
  const h = normalizeSidebarPath(href);
  if (p === h) return true;
  if (!fuzzy || h === "/") return false;
  return p.startsWith(`${h}/`);
}

export function SidebarLinks(props: { links: SidebarItem[]; isNested?: boolean }) {
  const location = useLocation();

  const routeMatches = (href: string) =>
    sidebarHrefMatchesPathname(location().pathname, href, true);

  return (
    <Show when={props.links.length > 0}>
      <Show
        when={props.isNested}
        fallback={
          <SidebarMenu>
            <LinkList links={props.links} routeMatches={routeMatches} />
          </SidebarMenu>
        }
      >
        <SidebarMenuSub>
          <LinkList links={props.links} routeMatches={routeMatches} />
        </SidebarMenuSub>
      </Show>
    </Show>
  );
}

function LinkList(props: {
  links: SidebarItem[];
  routeMatches: (href: string) => boolean;
}) {
  return (
    <For each={props.links}>
      {(item) => (
        <Show
          when={item.sublinks && item.sublinks.length > 0}
          fallback={
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to={item.href}
                isActive={props.routeMatches(item.href)}
                tooltip={item.title}
              >
                <ItemIcon icon={item.icon} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          }
        >
          <Collapsible
            defaultOpen={item.sublinks?.some((sub) => props.routeMatches(sub.href))}
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger
                as={SidebarMenuButton}
                isActive={item.sublinks?.some((sub) => props.routeMatches(sub.href))}
                tooltip={item.title}
              >
                <ItemIcon icon={item.icon} />
                <span>{item.title}</span>
                <FiChevronRight class="ml-auto transition-transform duration-200 group-data-expanded/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarLinks links={item.sublinks ?? []} isNested />
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </Show>
      )}
    </For>
  );
}

function ItemIcon(props: { icon?: Component<{ class?: string }> }) {
  return (
    <Show when={props.icon}>
      {(icon) => {
        const Icon = icon() as (iconProps: { class?: string }) => JSX.Element;
        return <Icon class="size-4" />;
      }}
    </Show>
  );
}
