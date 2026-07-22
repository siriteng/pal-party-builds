import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("home source contains the discovery experience", async () => {
  const [page, seedData, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/seed-builds.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Pal Party Builds/i);
  assert.match(page, /Palworld community builds/i);
  assert.match(page, /HomeFeed/);
  assert.match(seedData, /Jelliette/i);
  assert.match(seedData, /\+55–95% Fishing Items/i);
  assert.doesNotMatch(page, /Your site is taking shape/i);
});

test("build titles lead with measured results and visible taglines are removed", async () => {
  const [page, card, detail, composer, seedData] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/BuildCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/build/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/build/new/BuildComposer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/seed-builds.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /Find proven parties/);
  assert.doesNotMatch(card, /build\.summary/);
  assert.doesNotMatch(detail, /<p>\{build\.summary\}<\/p>/);
  assert.doesNotMatch(composer, /One-line promise|draft\.summary/);
  for (const numberTitle of ["55–95%", "35–45%", "40–80% Player Attack", "300–600 Carry", "40–80% Water Pal Drops"]) {
    assert.match(seedData, new RegExp(numberTitle));
  }
});

test("starter preview code and dependency are gone", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("production is isolated under the shared /builds path", async () => {
  const [nextConfig, wranglerConfig, paths] = await Promise.all([
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
    readFile(new URL("../lib/paths.ts", import.meta.url), "utf8"),
  ]);
  assert.match(nextConfig, /basePath:\s*["']\/builds["']/);
  assert.match(wranglerConfig, /palworld\.iterationx\.cloud\/builds/);
  assert.match(paths, /https:\/\/palworld\.iterationx\.cloud\/builds/);
  assert.doesNotMatch(wranglerConfig, /palbuilds\.iterationx\.cloud/);
});

test("Pal library contains the full sourced catalog", async () => {
  const catalog = JSON.parse(await readFile(new URL("../lib/pals.generated.json", import.meta.url), "utf8"));
  assert.equal(catalog.length, 299);
  assert.equal(new Set(catalog.map((pal) => pal.slug)).size, catalog.length);
  assert.ok(catalog.every((pal) => pal.name && pal.imageUrl && pal.elements.length && pal.partnerSkill));
  assert.ok(catalog.every((pal) => pal.shortEffect && !/^Uses .+\.$/.test(pal.shortEffect)));
  assert.match(catalog.find((pal) => pal.name === "Gobfin").shortEffect, /1\.1~2\.5/);
  assert.match(catalog.find((pal) => pal.name === "Gobfin").shortEffect, /10~20/);
  assert.match(catalog.find((pal) => pal.name === "Cattiva").shortEffect, /100~200/);
  for (const name of ["Lamball", "Anubis", "Jetragon", "Aegidron"]) {
    assert.ok(catalog.some((pal) => pal.name === name), `${name} should be available`);
  }
});

test("exact Partner Skill mechanics are visible in the builder and build detail", async () => {
  const [composer, detail, repository] = await Promise.all([
    readFile(new URL("../app/build/new/BuildComposer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/build/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/build-repository.ts", import.meta.url), "utf8"),
  ]);
  assert.match(composer, /SkillEffect/);
  assert.match(detail, /Lv\.1 → Lv\.5/);
  assert.match(repository, /canonical\?\.shortEffect/);
  assert.doesNotMatch(composer, /role: pal\?\.shortEffect/);
});

test("build discussion is backed by D1 comments", async () => {
  const [schema, route, detail, migration, repository] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/builds/[id]/comments/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/build/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_lush_moondragon.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/build-repository.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /comments = sqliteTable/);
  assert.match(route, /createBuildComment/);
  assert.match(detail, /BuildComments/);
  assert.match(migration, /CREATE TABLE `comments`/);
  assert.doesNotMatch(repository, /if \(value > 0\) return/);
});
