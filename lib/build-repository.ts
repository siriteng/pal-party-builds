import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { buildPals, builds, comments, likes, users } from "@/db/schema";
import { seedBuilds } from "./seed-builds";
import { isCategory } from "./seed-builds";
import { palBySlug } from "./pals";
import type { BuildPal, PartyBuild } from "./types";

type CreateBuildInput = {
  title: string;
  category: string;
  summary: string;
  strategy: string;
  passives?: string;
  baseSupport?: string;
  tags?: string[];
  gameVersion?: string;
  pals: Array<{
    slug: string;
    name: string;
    imageUrl: string;
    elements: string[];
    partnerSkill: string;
    shortEffect: string;
    role?: string;
    stackNote?: string;
  }>;
};

let seedPromise: Promise<void> | null = null;
const seedBuildById = new Map(seedBuilds.map((build) => [build.id, build]));

function seedAuthorId(name: string) {
  return `seed-user-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

async function seedDatabase() {
  const db = getDb();
  const now = Date.now();
  const authorRows = Array.from(new Set(seedBuilds.map((build) => build.author.name))).map((name) => ({
    id: seedAuthorId(name),
    discordId: `seed:${name}`,
    username: name,
    displayName: name,
    avatarUrl: "",
    createdAt: now,
    updatedAt: now,
  }));
  await db.insert(users).values(authorRows).onConflictDoNothing();

  await db.insert(builds).values(seedBuilds.map((build) => ({
    id: build.id,
    slug: build.slug,
    userId: seedAuthorId(build.author.name),
    title: build.title,
    category: build.category,
    summary: build.summary,
    strategy: build.strategy,
    passives: build.passives,
    baseSupport: build.baseSupport,
    tags: JSON.stringify(build.tags),
    gameVersion: build.gameVersion,
    baseLikes: build.likes,
    status: "published",
    createdAt: build.createdAt,
    updatedAt: build.createdAt,
  }))).onConflictDoNothing();

  await db.insert(buildPals).values(seedBuilds.flatMap((build) => build.pals.map((pal, slot) => ({
    id: `${build.id}-pal-${slot + 1}`,
    buildId: build.id,
    slot,
    palSlug: pal.slug,
    palName: pal.name,
    imageUrl: pal.imageUrl,
    role: pal.role,
    partnerSkill: pal.partnerSkill,
    stackNote: JSON.stringify({ note: pal.stackNote ?? "", elements: pal.elements, shortEffect: pal.shortEffect }),
  })))).onConflictDoNothing();
}

export async function ensureSeedData() {
  if (!seedPromise) seedPromise = seedDatabase().catch((error) => {
    seedPromise = null;
    throw error;
  });
  await seedPromise;
}

function parsePal(row: typeof buildPals.$inferSelect): BuildPal {
  let extra: { note?: string; elements?: string[]; shortEffect?: string } = {};
  try { extra = JSON.parse(row.stackNote); } catch { extra = { note: row.stackNote }; }
  const canonical = palBySlug.get(row.palSlug);
  return {
    slug: row.palSlug,
    name: canonical?.name ?? row.palName,
    imageUrl: canonical?.imageUrl ?? row.imageUrl,
    elements: canonical?.elements ?? extra.elements ?? [],
    partnerSkill: canonical?.partnerSkill ?? row.partnerSkill,
    shortEffect: canonical?.shortEffect ?? extra.shortEffect ?? "",
    role: row.role,
    stackNote: extra.note,
  };
}

export async function listBuilds(viewerUserId?: string): Promise<PartyBuild[]> {
  await ensureSeedData();
  const db = getDb();
  const rows = await db
    .select({ build: builds, authorName: users.displayName, avatarUrl: users.avatarUrl })
    .from(builds)
    .innerJoin(users, eq(builds.userId, users.id))
    .where(eq(builds.status, "published"))
    .orderBy(desc(builds.baseLikes), desc(builds.createdAt));

  if (!rows.length) return [];
  const buildIds = rows.map((row) => row.build.id);
  const [palRows, likeRows, viewerRows] = await Promise.all([
    db.select().from(buildPals).where(inArray(buildPals.buildId, buildIds)).orderBy(asc(buildPals.slot)),
    db.select({ buildId: likes.buildId, total: count() }).from(likes).where(inArray(likes.buildId, buildIds)).groupBy(likes.buildId),
    viewerUserId ? db.select({ buildId: likes.buildId }).from(likes).where(eq(likes.userId, viewerUserId)) : Promise.resolve([]),
  ]);

  const palsByBuild = new Map<string, BuildPal[]>();
  for (const row of palRows) palsByBuild.set(row.buildId, [...(palsByBuild.get(row.buildId) ?? []), parsePal(row)]);
  const likeTotals = new Map(likeRows.map((row) => [row.buildId, row.total]));
  const viewerLikes = new Set(viewerRows.map((row) => row.buildId));

  return rows.map(({ build, authorName, avatarUrl }) => {
    const canonical = seedBuildById.get(build.id);
    return {
      id: build.id,
      slug: build.slug,
      title: canonical?.title ?? build.title,
      category: canonical?.category ?? (isCategory(build.category) ? build.category : "Combat"),
      summary: canonical?.summary ?? build.summary,
      strategy: canonical?.strategy ?? build.strategy,
      passives: canonical?.passives ?? build.passives,
      baseSupport: canonical?.baseSupport ?? build.baseSupport,
      tags: canonical?.tags ?? safeTags(build.tags),
      gameVersion: canonical?.gameVersion ?? build.gameVersion,
      pals: palsByBuild.get(build.id) ?? [],
      likes: build.baseLikes + (likeTotals.get(build.id) ?? 0),
      likedByViewer: viewerLikes.has(build.id),
      author: { name: authorName, avatarUrl: avatarUrl || undefined },
      createdAt: build.createdAt,
    };
  });
}

export async function findBuildBySlug(slug: string, viewerUserId?: string) {
  const all = await listBuilds(viewerUserId);
  return all.find((build) => build.slug === slug);
}

function safeTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56) || "party-build";
}

export async function createBuild(userId: string, input: CreateBuildInput) {
  if (!isCategory(input.category)) throw new Error("Choose a valid category");
  if (!input.title.trim() || !input.strategy.trim()) throw new Error("Title and strategy are required");
  if (!input.pals.length || input.pals.length > 5) throw new Error("Choose between 1 and 5 Pals");

  await ensureSeedData();
  const db = getDb();
  const id = crypto.randomUUID();
  const slug = `${slugify(input.title)}-${id.slice(0, 6)}`;
  const now = Date.now();

  await db.insert(builds).values({
    id,
    slug,
    userId,
    title: input.title.trim().slice(0, 80),
    category: input.category,
    summary: input.summary.trim().slice(0, 220),
    strategy: input.strategy.trim().slice(0, 3000),
    passives: input.passives?.trim().slice(0, 1000) ?? "",
    baseSupport: input.baseSupport?.trim().slice(0, 1000) ?? "",
    tags: JSON.stringify((input.tags ?? []).slice(0, 6)),
    gameVersion: input.gameVersion?.trim().slice(0, 24) || "1.0",
    baseLikes: 0,
    status: "published",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(buildPals).values(input.pals.map((pal, slot) => ({
    id: crypto.randomUUID(),
    buildId: id,
    slot,
    palSlug: pal.slug,
    palName: pal.name.slice(0, 80),
    imageUrl: pal.imageUrl,
    role: pal.role?.trim().slice(0, 120) ?? "",
    partnerSkill: pal.partnerSkill.slice(0, 120),
    stackNote: JSON.stringify({ note: pal.stackNote?.slice(0, 180) ?? "", elements: pal.elements, shortEffect: pal.shortEffect }),
  })));

  return { id, slug };
}

export async function toggleBuildLike(buildId: string, userId: string) {
  await ensureSeedData();
  const db = getDb();
  const [existing] = await db.select().from(likes).where(and(eq(likes.buildId, buildId), eq(likes.userId, userId))).limit(1);
  if (existing) {
    await db.delete(likes).where(and(eq(likes.buildId, buildId), eq(likes.userId, userId)));
  } else {
    await db.insert(likes).values({ buildId, userId, createdAt: Date.now() });
  }

  const [{ baseLikes }] = await db.select({ baseLikes: builds.baseLikes }).from(builds).where(eq(builds.id, buildId));
  const [{ total }] = await db.select({ total: count() }).from(likes).where(eq(likes.buildId, buildId));
  return { liked: !existing, likes: (baseLikes ?? 0) + total };
}

export async function listBuildComments(buildId: string) {
  await ensureSeedData();
  const rows = await getDb()
    .select({ comment: comments, authorName: users.displayName, avatarUrl: users.avatarUrl })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.buildId, buildId))
    .orderBy(desc(comments.createdAt))
    .limit(100);

  return rows.map(({ comment, authorName, avatarUrl }) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    author: { name: authorName, avatarUrl: avatarUrl || undefined },
  }));
}

export async function createBuildComment(buildId: string, userId: string, value: string) {
  const body = value.trim();
  if (!body) throw new Error("Write a comment first.");
  if (body.length > 500) throw new Error("Comments can be up to 500 characters.");

  await ensureSeedData();
  const db = getDb();
  const [build] = await db.select({ id: builds.id }).from(builds).where(and(eq(builds.id, buildId), eq(builds.status, "published"))).limit(1);
  if (!build) throw new Error("Build not found.");

  const id = crypto.randomUUID();
  const createdAt = Date.now();
  await db.insert(comments).values({ id, buildId, userId, body, createdAt });
  const [author] = await db.select({ name: users.displayName, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, userId)).limit(1);
  return { id, body, createdAt, author: { name: author?.name ?? "Player", avatarUrl: author?.avatarUrl || undefined } };
}
