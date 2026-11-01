import {
  BreadcrumbList,
  Breadcrumbs,
  BreadcrumbsItem,
  BreadcrumbsSeparator,
} from "@/components/ui/breadcrumbs";
import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { useTSRBreadCrumbs } from "./use-tsr-breadcrumbs";

export function TSRBreadCrumbs() {
  const { breadcrumb_routes } = useTSRBreadCrumbs();

  return (
    <Show when={breadcrumb_routes().length >= 1}>
      <div class="flex min-w-0 flex-wrap gap-0.5">
        <Breadcrumbs>
          <BreadcrumbList>
            <For each={breadcrumb_routes()}>
              {(crumb, index) => (
                <Show
                  when={index() < breadcrumb_routes().length - 1}
                  fallback={
                    <BreadcrumbsItem>
                      <span class="line-clamp-1 text-xs text-foreground">{crumb.name}</span>
                    </BreadcrumbsItem>
                  }
                >
                  <BreadcrumbsItem>
                    <Link
                      to={crumb.path}
                      class="line-clamp-1 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                      {crumb.name}
                    </Link>
                    <BreadcrumbsSeparator class="hidden md:block" />
                  </BreadcrumbsItem>
                </Show>
              )}
            </For>
          </BreadcrumbList>
        </Breadcrumbs>
      </div>
    </Show>
  );
}
