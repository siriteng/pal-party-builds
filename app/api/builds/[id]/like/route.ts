import { cookie, getSessionUser, LIKE_INTENT_COOKIE, parseCookieHeader, safeReturnTo } from "@/lib/auth";
import { toggleBuildLike } from "@/lib/build-repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });
    const { id } = await context.params;
    const user = await getSessionUser(request);
    if (!user) {
      const response = Response.json({ error: "Sign in with Discord to like builds." }, { status: 401 });
      response.headers.append("Set-Cookie", cookie(LIKE_INTENT_COOKIE, id, { maxAge: 600, secure: url.protocol === "https:" }));
      return response;
    }
    return Response.json(await toggleBuildLike(id, user.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update this like.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("return_to"));
  try {
    const { id } = await context.params;
    const intent = parseCookieHeader(request.headers.get("cookie")).get(LIKE_INTENT_COOKIE);
    if (intent !== id) return Response.redirect(new URL(returnTo, url.origin));
    const user = await getSessionUser(request);
    if (!user) {
      const resume = `${url.pathname}?return_to=${encodeURIComponent(returnTo)}`;
      return Response.redirect(new URL(`/auth/discord?return_to=${encodeURIComponent(resume)}`, url.origin));
    }
    await toggleBuildLike(id, user.id);
    const response = Response.redirect(new URL(returnTo, url.origin));
    response.headers.append("Set-Cookie", cookie(LIKE_INTENT_COOKIE, "", { maxAge: 0, secure: url.protocol === "https:" }));
    return response;
  } catch {
    return Response.redirect(new URL(returnTo, url.origin));
  }
}
