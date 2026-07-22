import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    return Response.json({ user: await getSessionUser(request) });
  } catch {
    return Response.json({ user: null });
  }
}
