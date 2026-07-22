import { cookie, deleteSession, redirect, SESSION_COOKIE } from "@/lib/auth";
import { withBasePath } from "@/lib/paths";

export async function GET(request: Request) {
  const url = new URL(request.url);
  await deleteSession(request).catch(() => undefined);
  const response = redirect(new URL(withBasePath("/"), url.origin));
  response.headers.append("Set-Cookie", cookie(SESSION_COOKIE, "", { maxAge: 0, secure: url.protocol === "https:" }));
  return response;
}
