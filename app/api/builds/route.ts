import { createBuild, listBuilds } from "@/lib/build-repository";
import { getSessionUser } from "@/lib/auth";
import { palBySlug } from "@/lib/pals";
import { seedBuilds } from "@/lib/seed-builds";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request).catch(() => null);
    return Response.json({ builds: await listBuilds(user?.id) });
  } catch {
    return Response.json({ builds: seedBuilds, preview: true });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "Sign in with Discord to publish." }, { status: 401 });

    const payload = await request.json() as {
      title?: string;
      category?: string;
      summary?: string;
      strategy?: string;
      passives?: string;
      baseSupport?: string;
      tags?: string[];
      gameVersion?: string;
      pals?: Array<{ slug?: string; role?: string; stackNote?: string }>;
    };

    const selectedPals = (payload.pals ?? []).map((selection) => {
      const pal = selection.slug ? palBySlug.get(selection.slug) : undefined;
      if (!pal) throw new Error("One of the selected Pals is unavailable.");
      return { ...pal, role: selection.role ?? "", stackNote: selection.stackNote ?? "" };
    });

    const result = await createBuild(user.id, {
      title: payload.title ?? "",
      category: payload.category ?? "",
      summary: payload.summary ?? "",
      strategy: payload.strategy ?? "",
      passives: payload.passives,
      baseSupport: payload.baseSupport,
      tags: payload.tags,
      gameVersion: payload.gameVersion,
      pals: selectedPals,
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish this build.";
    return Response.json({ error: message }, { status: 400 });
  }
}
