import { cookie, getSecret, OAUTH_RETURN_COOKIE, OAUTH_STATE_COOKIE, randomToken, safeReturnTo } from "@/lib/auth";
import { withBasePath } from "@/lib/paths";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = getSecret("DISCORD_CLIENT_ID");
  if (!clientId) return Response.redirect(new URL(withBasePath("/auth/error?reason=not-configured"), url.origin));

  const state = randomToken(24);
  const returnTo = safeReturnTo(url.searchParams.get("return_to"));
  const appUrl = getSecret("APP_URL") ?? url.origin;
  const redirectUri = `${appUrl.replace(/\/$/, "")}/auth/discord/callback`;
  const discordUrl = new URL("https://discord.com/oauth2/authorize");
  discordUrl.searchParams.set("client_id", clientId);
  discordUrl.searchParams.set("response_type", "code");
  discordUrl.searchParams.set("redirect_uri", redirectUri);
  discordUrl.searchParams.set("scope", "identify");
  discordUrl.searchParams.set("state", state);
  discordUrl.searchParams.set("prompt", "consent");

  const response = Response.redirect(discordUrl);
  const secure = url.protocol === "https:";
  response.headers.append("Set-Cookie", cookie(OAUTH_STATE_COOKIE, state, { maxAge: 600, secure }));
  response.headers.append("Set-Cookie", cookie(OAUTH_RETURN_COOKIE, returnTo, { maxAge: 600, secure }));
  return response;
}
