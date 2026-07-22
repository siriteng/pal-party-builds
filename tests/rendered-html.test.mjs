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
  assert.match(page, /Stop guessing/i);
  assert.match(page, /HomeFeed/);
  assert.match(seedData, /Jelliette/i);
  assert.match(seedData, /Talented Pal Fishing Party/i);
  assert.doesNotMatch(page, /Your site is taking shape/i);
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
  for (const name of ["Lamball", "Anubis", "Jetragon", "Aegidron"]) {
    assert.ok(catalog.some((pal) => pal.name === name), `${name} should be available`);
  }
});
