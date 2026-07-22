import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const pageUrl = "https://palworld.gg/pals";
const outputPath = resolve("lib/pals.generated.json");
const inputIndex = process.argv.indexOf("--input");
const inputPath = inputIndex >= 0 ? process.argv[inputIndex + 1] : "";

const elementNames = {
  Normal: "Neutral",
  Earth: "Ground",
  Leaf: "Grass",
  Electricity: "Electric",
  Ice: "Ice",
  Dark: "Dark",
  Dragon: "Dragon",
  Water: "Water",
  Fire: "Fire",
};

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "pal-party-builds data sync" } });
  if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`);
  return response.text();
}

async function findDataModule() {
  const html = await fetchText(pageUrl);
  const assets = [...new Set(html.match(/\/_nuxt\/[A-Za-z0-9_-]+\.js/g) ?? [])];

  for (const asset of assets) {
    const source = await fetchText(new URL(asset, pageUrl).href);
    if (!source.includes("../data/pals/en.json")) continue;
    const match = source.match(/\.\.\/data\/pals\/en\.json[\s\S]{0,120}?import\("\.\/([^\"]+\.js)"\)/);
    if (match) return new URL(`/_nuxt/${match[1]}`, pageUrl).href;
  }

  throw new Error("Could not locate the English Pal data module on palworld.gg.");
}

async function loadSourceData() {
  if (inputPath) return import(pathToFileURL(resolve(inputPath)).href);

  const workDir = await mkdtemp(join(tmpdir(), "pal-party-builds-"));
  try {
    const moduleUrl = await findDataModule();
    const modulePath = join(workDir, basename(moduleUrl).replace(/\.js$/, ".mjs"));
    await writeFile(modulePath, await fetchText(moduleUrl));
    return await import(pathToFileURL(modulePath).href);
  } finally {
    await rm(workDir, { force: true, recursive: true });
  }
}

const source = await loadSourceData();
const sourcePals = Object.values(source.default).filter((pal) => pal.name && pal.slug && pal.icon && !pal.isBoss);
const generatedPals = sourcePals
  .map((pal) => ({
    slug: pal.slug,
    name: pal.name,
    imageUrl: `https://palworld.gg/images/full_palicon/${pal.icon}.png`,
    elements: pal.elements?.length ? pal.elements.map((element) => elementNames[element] ?? element) : ["Unknown"],
    partnerSkill: pal.partnerSkill?.name || "Partner Skill",
    shortEffect: `Uses ${pal.partnerSkill?.name || "its Partner Skill"}.`,
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "en"));

if (generatedPals.length < 299) throw new Error(`Expected at least 299 Pals, found ${generatedPals.length}.`);
if (new Set(generatedPals.map((pal) => pal.slug)).size !== generatedPals.length) throw new Error("Duplicate Pal slugs found.");
if (generatedPals.some((pal) => !pal.elements.length)) throw new Error("A Pal is missing its element.");

const previous = await readFile(outputPath, "utf8").catch(() => "");
const next = `${JSON.stringify(generatedPals, null, 2)}\n`;
if (previous !== next) await writeFile(outputPath, next);
console.log(`Synced ${generatedPals.length} Pals from ${pageUrl}`);
