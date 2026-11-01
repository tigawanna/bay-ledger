import type { NavigateOptions } from "@tanstack/solid-router";
import { createEffect, createSignal, onCleanup } from "solid-js";

interface UseTSRSearchQueryProps<TSearch extends Record<string, unknown>> {
  search: () => TSearch;
  navigate: (opts: NavigateOptions) => void;
  query_param: keyof TSearch;
  default_value?: string;
  debounce_delay?: number;
}

/**
 * Debounced search-param hook.
 *
 * Pass accessors from the route component:
 * `search: () => Route.useSearch()` and `navigate: Route.useNavigate()`.
 * The route's search schema must include `query_param`.
 */
export function useTSRSearchQuery<TSearch extends Record<string, unknown>>(
  opts: UseTSRSearchQueryProps<TSearch>,
) {
  const queryParam = opts.query_param;
  const debounceDelay = opts.debounce_delay ?? 1000;

  const paramValue = () => {
    const value = opts.search()?.[queryParam];
    if (value === undefined || value === null || value === "") {
      return opts.default_value ?? "";
    }
    return String(value);
  };

  const [keyword, setKeyword] = createSignal(paramValue());
  const [debouncedValue, setDebouncedValue] = createSignal(keyword());
  const [isDebouncing, setIsDebouncing] = createSignal(false);

  createEffect(() => {
    const next = keyword();
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(next);
      setIsDebouncing(false);
    }, debounceDelay);
    onCleanup(() => clearTimeout(timer));
  });

  const setSearchParams = (patch: Partial<TSearch>) => {
    opts.navigate({
      search: (prev) => ({
        ...(prev as TSearch),
        ...patch,
      }),
      replace: true,
    });
  };

  createEffect(() => {
    const next = debouncedValue();
    if (paramValue() === next) return;
    opts.navigate({
      search: (prev) => ({
        ...(prev as TSearch),
        [queryParam]: next || undefined,
      }),
      replace: true,
    });
  });

  return { debouncedValue, isDebouncing, keyword, setKeyword, setSearchParams };
}
