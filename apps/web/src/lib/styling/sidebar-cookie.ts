export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function parseSidebarOpen(value: string | undefined) {
  if (value === undefined) return true;
  return value === "true";
}
