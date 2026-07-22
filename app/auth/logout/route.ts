import { cookie, deleteSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  await deleteSession(request).catch(() => undefined);
  const response = Response.redirect(new URL("/", url.origin));
  response.headers.append("Set-Cookie", cookie(SESSION_COOKIE, "", { maxAge: 0, secure: url.protocol === "https:" }));
  return response;
}
