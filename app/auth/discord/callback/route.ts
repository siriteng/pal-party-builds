import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { cookie, createSession, getSecret, OAUTH_RETURN_COOKIE, OAUTH_STATE_COOKIE, parseCookieHeader, redirect, safeReturnTo, SESSION_COOKIE } from "@/lib/auth";
import { ensureSeedData } from "@/lib/build-repository";
import { withBasePath } from "@/lib/paths";

type DiscordToken = { access_token?: string; token_type?: string };
type DiscordUser = { id: string; username: string; global_name?: string | null; avatar?: string | null };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const expectedState = cookies.get(OAUTH_STATE_COOKIE);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const returnTo = safeReturnTo(cookies.get(OAUTH_RETURN_COOKIE));
  const clientId = getSecret("DISCORD_CLIENT_ID");
  const clientSecret = getSecret("DISCORD_CLIENT_SECRET");
  const appUrl = getSecret("APP_URL") ?? url.origin;
  const secure = url.protocol === "https:";

  if (!code || !state || !expectedState || state !== expectedState || !clientId || !clientSecret) {
    return redirect(new URL(withBasePath("/auth/error?reason=invalid-state"), url.origin));
  }

  try {
    const redirectUri = `${appUrl.replace(/\/$/, "")}/auth/discord/callback`;
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    if (!tokenResponse.ok) throw new Error("Discord token exchange failed");
    const token = await tokenResponse.json() as DiscordToken;
    if (!token.access_token) throw new Error("Discord returned no access token");

    const userResponse = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!userResponse.ok) throw new Error("Discord profile request failed");
    const discordUser = await userResponse.json() as DiscordUser;
    await ensureSeedData();

    const db = getDb();
    const [existing] = await db.select().from(users).where(eq(users.discordId, discordUser.id)).limit(1);
    const now = Date.now();
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discordUser.id.slice(-4)) % 6}.png`;
    const displayName = discordUser.global_name || discordUser.username;
    const userId = existing?.id ?? crypto.randomUUID();

    if (existing) {
      await db.update(users).set({ username: discordUser.username, displayName, avatarUrl, updatedAt: now }).where(eq(users.id, userId));
    } else {
      await db.insert(users).values({ id: userId, discordId: discordUser.id, username: discordUser.username, displayName, avatarUrl, createdAt: now, updatedAt: now });
    }

    const session = await createSession(userId);
    const response = redirect(new URL(withBasePath(returnTo), url.origin));
    response.headers.append("Set-Cookie", cookie(SESSION_COOKIE, session.token, { maxAge: session.maxAge, secure }));
    response.headers.append("Set-Cookie", cookie(OAUTH_STATE_COOKIE, "", { maxAge: 0, secure }));
    response.headers.append("Set-Cookie", cookie(OAUTH_RETURN_COOKIE, "", { maxAge: 0, secure }));
    return response;
  } catch {
    return redirect(new URL(withBasePath("/auth/error?reason=callback"), url.origin));
  }
}
