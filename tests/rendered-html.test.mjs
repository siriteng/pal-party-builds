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
