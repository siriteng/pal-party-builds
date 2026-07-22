import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const pageUrl = "https://paldb.cc/en/Partner_Skill";
const catalogPath = resolve("lib/pals.generated.json");
const inputIndex = process.argv.indexOf("--input");
const inputPath = inputIndex >= 0 ? process.argv[inputIndex + 1] : "";

function decodeHtml(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
    const numeric = code[1].toLowerCase() === "x"
      ? Number.parseInt(code.slice(2), 16)
      : Number.parseInt(code.slice(1), 10);
    return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
  });
}

function plainText(value) {
  return decodeHtml(value)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n+ */g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?%])/g, "$1")
    .replace(/\s+(['’]s)\b/g, "$1")
    .trim();
}

function normalizeName(value) {
  return decodeHtml(value)
    .normalize("NFKD")
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function matchingDivContents(source, openingIndex) {
  const openingEnd = source.indexOf(">", openingIndex);
  if (openingEnd < 0) return "";
  const divPattern = /<\/?div\b[^>]*>/gi;
  divPattern.lastIndex = openingEnd + 1;
  let depth = 1;
  let match;
  while ((match = divPattern.exec(source))) {
    depth += match[0][1] === "/" ? -1 : 1;
    if (depth === 0) return source.slice(openingEnd + 1, match.index);
  }
  return "";
}

function parsePartnerSkills(html) {
  const sectionStart = html.indexOf('id="PartnerSkill"');
  const sectionEnd = html.indexOf('id="Player"', sectionStart);
  if (sectionStart < 0 || sectionEnd < 0) throw new Error("Could not find the Partner Skill section on PalDB.");

  const section = html.slice(sectionStart, sectionEnd);
  const cards = section.split('<div class="col"><div class="card itemPopup">').slice(1);
  const results = new Map();

  for (const card of cards) {
    const nameMatch = card.match(/<a class="itemname"[^>]*>([\s\S]*?)<\/a>/i);
    const skillMatch = card.match(/<span class="ms-2">([\s\S]*?)<\/span>\s*Lv\.1/i);
    if (!nameMatch || !skillMatch) continue;

    const skillEnd = skillMatch.index + skillMatch[0].length;
    const effectStart = card.indexOf('<div class="flex-grow-1 ms-2">', skillEnd);
    if (effectStart < 0) continue;
    let effectHtml = matchingDivContents(card, effectStart);
    const technologyStart = effectHtml.search(/<div\b[^>]*>[\s\S]*?Technology/i);
    if (technologyStart >= 0) effectHtml = effectHtml.slice(0, technologyStart);

    const name = plainText(nameMatch[1]);
    const partnerSkill = plainText(skillMatch[1]);
    const shortEffect = plainText(effectHtml);
    if (!name || !partnerSkill || !shortEffect) continue;
    results.set(normalizeName(name), { name, partnerSkill, shortEffect });
  }

  return results;
}

async function loadHtml() {
  if (inputPath) return readFile(resolve(inputPath), "utf8");
  const response = await fetch(pageUrl, { headers: { "user-agent": "pal-party-builds data sync" } });
  if (!response.ok) throw new Error(`Could not fetch ${pageUrl}: ${response.status}`);
  return response.text();
}

const [html, catalogSource] = await Promise.all([loadHtml(), readFile(catalogPath, "utf8")]);
const skills = parsePartnerSkills(html);
const catalog = JSON.parse(catalogSource);
const missing = [];

const updated = catalog.map((pal) => {
  const skill = skills.get(normalizeName(pal.name));
  if (!skill) {
    missing.push(pal.name);
    return pal;
  }
  return { ...pal, partnerSkill: skill.partnerSkill, shortEffect: skill.shortEffect };
});

if (skills.size < 299) throw new Error(`Expected 299 Partner Skills from PalDB, found ${skills.size}.`);
if (missing.length) throw new Error(`Missing Partner Skills for: ${missing.join(", ")}`);
if (updated.some((pal) => !pal.shortEffect || /^Uses .+\.$/.test(pal.shortEffect))) {
  throw new Error("One or more Pals still have a placeholder skill description.");
}

await writeFile(catalogPath, `${JSON.stringify(updated, null, 2)}\n`);
console.log(`Synced exact Partner Skill mechanics for ${updated.length} Pals from ${pageUrl}`);
