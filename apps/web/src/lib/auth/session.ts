import { createIsomorphicFn } from "@tanstack/solid-start";
import { getCookie } from "@tanstack/solid-start/server";

export const AUTH_COOKIE_NAME = "bayledger.auth";
const TOKENS_KEY = "bayledger.tokens";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthSession = {
  username: string;
  groups: string[];
};

export type AuthTokens = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
};

export function parseAuthSession(value: string | undefined): AuthSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as AuthSession;
    if (!parsed?.username) return null;
    return { username: parsed.username, groups: parsed.groups ?? [] };
  } catch {
    return null;
  }
}

export const getAuthSession = createIsomorphicFn()
  .server(() => parseAuthSession(getCookie(AUTH_COOKIE_NAME)))
  .client(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
    return parseAuthSession(match?.[1] ? decodeURIComponent(match[1]) : undefined);
  });

export function writeAuthSession(session: AuthSession, tokens: AuthTokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthSession() {
  localStorage.removeItem(TOKENS_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readAuthTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function groupsFromIdToken(idToken: string): string[] {
  const payload = decodeJwt(idToken);
  const groups = payload["cognito:groups"];
  return Array.isArray(groups) ? groups.filter((g): g is string => typeof g === "string") : [];
}

export function usernameFromIdToken(idToken: string): string {
  const payload = decodeJwt(idToken);
  if (typeof payload.email === "string") return payload.email;
  if (typeof payload["cognito:username"] === "string") return payload["cognito:username"];
  return "crew";
}

function decodeJwt(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  if (!payload) return {};
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json) as Record<string, unknown>;
}

export function safeRedirectPath(value: unknown): "/messages" | (string & {}) {
  if (typeof value !== "string") return "/messages";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/sign-")) {
    return "/messages";
  }
  return value;
}
