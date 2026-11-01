import type { FileRoutesById } from "@/routeTree.gen";
import type { RegisteredRouter } from "@tanstack/solid-router";

export type AppRouter = RegisteredRouter;

export type RoutesByPath = RegisteredRouter["routesByPath"];

export type ValidRoutes = RegisteredRouter["routesByPath"][keyof RoutesByPath]["fullPath"];

export type SearchParamsForRoute<T extends ValidRoutes> = RoutesByPath[T]["types"]["searchSchema"];

export type SearchParamKeysForRoute<T extends ValidRoutes> = keyof SearchParamsForRoute<T>;

export type SearchParamValue<
  TRoute extends ValidRoutes,
  TKey extends SearchParamKeysForRoute<TRoute>,
> = SearchParamsForRoute<TRoute>[TKey];

export type TRouteID = keyof FileRoutesById;
