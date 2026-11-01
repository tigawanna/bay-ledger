import { createIsomorphicFn } from "@tanstack/solid-start";
import { getCookie } from "@tanstack/solid-start/server";
import { parseSidebarOpen, SIDEBAR_COOKIE_NAME } from "~/lib/styling/sidebar-cookie";

export const getSidebarDefaultOpen = createIsomorphicFn()
  .server(() => parseSidebarOpen(getCookie(SIDEBAR_COOKIE_NAME)))
  .client(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${SIDEBAR_COOKIE_NAME}=([^;]*)`));
    return parseSidebarOpen(match?.[1] ? decodeURIComponent(match[1]) : undefined);
  });
