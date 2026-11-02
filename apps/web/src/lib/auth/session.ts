import { createIsomorphicFn } from "@tanstack/solid-start";
import { getCookie } from "@tanstack/solid-start/server";

export const AUTH_COOKIE_NAME = "bayledger.auth";
const TOKENS_KEY = "bayledger.tokens";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthSession = {
  username: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  role?: string;
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
    return {
      username: parsed.username,
      email: parsed.email,
      givenName: parsed.givenName,
      familyName: parsed.familyName,
      role: parsed.role,
      groups: parsed.groups ?? [],
    };
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
  if (typeof localStorage === "undefined") return null;
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

export function sessionFromIdToken(idToken: string): AuthSession {
  const payload = decodeJwt(idToken);
  const email = claimString(payload.email);
  return {
    username: email ?? claimString(payload["cognito:username"]) ?? "crew",
    email,
    givenName: claimString(payload.given_name),
    familyName: claimString(payload.family_name),
    role: claimString(payload["custom:role"]),
    groups: groupsFromIdToken(idToken),
  };
}

export function usernameFromIdToken(idToken: string): string {
  return sessionFromIdToken(idToken).username;
}

export function displayName(session: AuthSession | null | undefined): string {
  if (!session) return "Crew";
  const name = [session.givenName, session.familyName].filter(Boolean).join(" ");
  return name || session.email || session.username;
}

export function initials(session: AuthSession | null | undefined): string {
  const name = displayName(session);
  const parts = name.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

/** Prefer JWT claims on the client so older cookies still show name/email. */
export function resolveAuthSession(): AuthSession | null {
  const cookie = getAuthSession();
  if (typeof document === "undefined") return cookie;
  const tokens = readAuthTokens();
  if (!tokens?.idToken) return cookie;
  try {
    return sessionFromIdToken(tokens.idToken);
  } catch {
    return cookie;
  }
}

function claimString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
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
