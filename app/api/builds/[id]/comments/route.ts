import { createBuildComment, listBuildComments } from "@/lib/build-repository";
import { getSessionUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return Response.json({ comments: await listBuildComments(id) });
  } catch {
    return Response.json({ error: "Could not load comments." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });

    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "Sign in with Discord to comment." }, { status: 401 });

    const { id } = await params;
    const payload = await request.json() as { body?: string };
    const comment = await createBuildComment(id, user.id, payload.body ?? "");
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not post comment.";
    return Response.json({ error: message }, { status: 400 });
  }
}
