import { and, eq, gt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "ppb_session";
export const OAUTH_STATE_COOKIE = "ppb_oauth_state";
export const OAUTH_RETURN_COOKIE = "ppb_oauth_return";
export const LIKE_INTENT_COOKIE = "ppb_like_intent";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getSecret(name: string) {
  const bindings = env as unknown as Record<string, unknown>;
  const value = bindings[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function parseCookieHeader(header: string | null) {
  const result = new Map<string, string>();
  for (const part of (header ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) result.set(key, decodeURIComponent(value));
  }
  return result;
}

export function safeReturnTo(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function cookie(name: string, value: string, options: { maxAge?: number; secure?: boolean; httpOnly?: boolean } = {}) {
  const pieces = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax"];
  if (options.httpOnly !== false) pieces.push("HttpOnly");
  if (options.secure) pieces.push("Secure");
  if (typeof options.maxAge === "number") pieces.push(`Max-Age=${options.maxAge}`);
  return pieces.join("; ");
}

export function randomToken(bytes = 32) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return base64Url(data);
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function hashToken(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(new Uint8Array(digest));
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const token = parseCookieHeader(request.headers.get("cookie")).get(SESSION_COOKIE);
  if (!token) return null;
  const sessionId = await hashToken(token);
  const db = getDb();
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Date.now())))
    .limit(1);
  if (!row) return null;
  return {
    id: row.user.id,
    username: row.user.username,
    displayName: row.user.displayName,
    avatarUrl: row.user.avatarUrl,
  };
}

export async function createSession(userId: string) {
  const token = randomToken();
  const id = await hashToken(token);
  const now = Date.now();
  await getDb().insert(sessions).values({ id, userId, createdAt: now, expiresAt: now + SESSION_AGE_SECONDS * 1000 });
  return { token, maxAge: SESSION_AGE_SECONDS };
}

export async function deleteSession(request: Request) {
  const token = parseCookieHeader(request.headers.get("cookie")).get(SESSION_COOKIE);
  if (!token) return;
  await getDb().delete(sessions).where(eq(sessions.id, await hashToken(token)));
}
