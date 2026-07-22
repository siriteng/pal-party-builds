import { palBySlug } from "./pals";
import type { BuildPal, Category, PartyBuild } from "./types";

const seededAt = Date.UTC(2026, 6, 18);

function party(slugs: string[], roles: string[], stackNotes: string[] = []): BuildPal[] {
  return slugs.map((slug, index) => {
    const pal = palBySlug.get(slug);
    if (!pal) throw new Error(`Unknown seed Pal: ${slug}`);
    return { ...pal, role: roles[index] ?? "Party support", stackNote: stackNotes[index] };
  });
}

function build(input: Omit<PartyBuild, "createdAt"> & { createdAt?: number }): PartyBuild {
  return { ...input, createdAt: input.createdAt ?? seededAt };
}

export const seedBuilds: PartyBuild[] = [
  build({
    id: "seed-fishing-talents",
    slug: "talented-pal-fishing-party",
    title: "Talented Pal Fishing Party",
    category: "Fishing",
    summary: "A low-stress fishing team that keeps the minigame forgiving while improving valuable catches.",
    strategy: "Jelliette and Gloopie cover loot and gauge control. Use both Whalaska variants when the fishing spot is difficult, or swap one for Solmora when talent hunting matters more.",
    passives: "On your swimming Pal: King of the Waves, Ace Swimmer, Swift, and Dimensional Leap.",
    baseSupport: "None required.",
    tags: ["Fishing", "Talented Pals", "Easy Minigame"],
    gameVersion: "1.0",
    pals: party(
      ["jelliette", "gloopie", "whalaska", "whalaska-ignis", "solmora-lux"],
      ["More fishing drops", "Gauge control", "Capture progress", "Variant progress bonus", "Talent hunting"],
      ["Unique effect", "Unique effect", "Stacks with Ignis variant", "Stacks with base variant", "Stacks with Solmora"]
    ),
    likes: 1284,
    author: { name: "MossyByte" },
  }),
  build({
    id: "seed-egg-gathering",
    slug: "alpha-egg-gathering-loop",
    title: "Alpha Egg Gathering Loop",
    category: "Breeding",
    summary: "Collect more eggs and raise the chance that picked-up eggs become Alpha eggs.",
    strategy: "Broncherry and Broncherry Aqua count as different breeds, so their effects can work together. Grintale adds the chance for one extra egg, including eggs collected from Breeding Pens.",
    passives: "Babysitter is ideal for base support Pals during the early breeding game.",
    baseSupport: "Braloha boosts egg production; Dynamoff reduces incubation time.",
    tags: ["Eggs", "Alpha Eggs", "Breeding Pens"],
    gameVersion: "1.0",
    pals: party(
      ["broncherry", "broncherry-aqua", "grintale"],
      ["Alpha egg chance", "Variant Alpha chance", "Extra egg chance"],
      ["Stacks with Aqua variant", "Stacks with base variant", "Separate effect"]
    ),
    likes: 947,
    author: { name: "EggcelSheet" },
  }),
  build({
    id: "seed-player-dps",
    slug: "full-auto-player-dps-stack",
    title: "Full-Auto Player DPS Stack",
    category: "Combat",
    summary: "A simple player-damage shell for turning good guns into boss-melting weapons.",
    strategy: "Keep four Attack-boosting Gobfin variants in the party and use the final slot for the elemental weak-point modifier that matches your target.",
    passives: "Vanguard on party supports. Use weapon and player passives on your active mount.",
    baseSupport: "No base setup required.",
    tags: ["Bossing", "Player Damage", "Guns"],
    gameVersion: "1.0",
    pals: party(
      ["gobfin", "gobfin", "gobfin-ignis", "gobfin-ignis", "croajiro-noct"],
      ["Player Attack", "Player Attack", "Player Attack", "Player Attack", "Dark weak points"]
    ),
    likes: 821,
    author: { name: "RaidSnack" },
  }),
  build({
    id: "seed-exploration",
    slug: "leave-no-loot-behind",
    title: "Leave No Loot Behind",
    category: "Exploration",
    summary: "Find hidden objectives, open locked chests, and carry the haul home in one trip.",
    strategy: "Pulse Nox and Tombat while moving through a new area. Lunaris covers carrying capacity, Mimog handles locked chests, and Fuddler softens the weight of stone-heavy routes.",
    passives: "Movement Speed and Partner Skill Cooldown are more useful than raw combat stats here.",
    baseSupport: "Travel light; this build is designed to stay away from base longer.",
    tags: ["Treasure", "Effigies", "Carry Weight"],
    gameVersion: "1.0",
    pals: party(
      ["nox", "tombat", "lunaris", "mimog", "fuddler"],
      ["Effigy radar", "Dungeon & chest radar", "Carry capacity", "Keyless chests", "Stone weight"]
    ),
    likes: 706,
    author: { name: "MapGremlin" },
  }),
  build({
    id: "seed-pal-fluid",
    slug: "cheap-pal-fluid-capture-run",
    title: "Cheap Pal Fluid Capture Run",
    category: "Farming",
    summary: "Farm Water Pals with better drops while burning through fewer Pal Spheres.",
    strategy: "Fenglope Lux raises Water Pal drops. Katress can preserve thrown spheres, while Lunaris and a light utility core keep long capture routes comfortable.",
    passives: "Swift and Runner keep the route moving; Vanguard is optional if you finish targets with weapons.",
    baseSupport: "Bring enough storage space for long Gobfin loops.",
    tags: ["Pal Fluids", "Capture", "Resource Farm"],
    gameVersion: "1.0",
    pals: party(
      ["fenglope-lux", "katress", "lunaris", "gobfin", "gumoss"],
      ["Water drop bonus", "Sphere saver", "Carry capacity", "Route damage", "Wood weight"]
    ),
    likes: 514,
    author: { name: "SphereSaver" },
  }),
];

export function getSeedBuild(slug: string) {
  return seedBuilds.find((item) => item.slug === slug);
}

export function isCategory(value: string): value is Category {
  return ["Combat", "Breeding", "Fishing", "Exploration", "Farming"].includes(value);
}
