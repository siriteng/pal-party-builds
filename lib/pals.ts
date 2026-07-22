import type { Pal } from "./types";

const CDN = "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal";
const image = (asset: string) => `${CDN}/T_${asset}_icon_normal.webp`;

export const pals: Pal[] = [
  { slug: "jelliette", name: "Jelliette", imageUrl: image("JellyfishFairy"), elements: ["Water"], partnerSkill: "Jelliette Drop", shortEffect: "Increases items obtained from fishing." },
  { slug: "gloopie", name: "Gloopie", imageUrl: image("OctopusGirl"), elements: ["Water", "Dark"], partnerSkill: "Sticky Princess", shortEffect: "Slows fishing gauge loss when bars separate." },
  { slug: "whalaska", name: "Whalaska", imageUrl: image("IceNarwhal"), elements: ["Ice", "Water"], partnerSkill: "Chilled Whale Cruiser", shortEffect: "Starts fishing with more capture progress." },
  { slug: "whalaska-ignis", name: "Whalaska Ignis", imageUrl: image("IceNarwhalFire"), elements: ["Ice", "Fire"], partnerSkill: "Cozy Whale Cruiser", shortEffect: "Variant fishing bonus that can pair with Whalaska." },
  { slug: "solmora", name: "Solmora", imageUrl: image("KingSunfish"), elements: ["Water"], partnerSkill: "Charming Fish", shortEffect: "Improves the chance to fish talented Pals." },
  { slug: "solmora-lux", name: "Solmora Lux", imageUrl: image("KingSunfishThunder"), elements: ["Water", "Electric"], partnerSkill: "Shocking Fish", shortEffect: "Variant talent-fishing bonus." },
  { slug: "broncherry", name: "Broncherry", imageUrl: image("SakuraSaurus"), elements: ["Grass"], partnerSkill: "Love's First Blossom", shortEffect: "Chance for collected Pal Eggs to become Alpha eggs." },
  { slug: "broncherry-aqua", name: "Broncherry Aqua", imageUrl: image("SakuraSaurusWater"), elements: ["Grass", "Water"], partnerSkill: "Purity's Full Bloom", shortEffect: "Variant Alpha-egg bonus that pairs with Broncherry." },
  { slug: "grintale", name: "Grintale", imageUrl: image("NaughtyCat"), elements: ["Neutral"], partnerSkill: "Glaring Cat's Eye", shortEffect: "Chance to receive an extra Pal Egg." },
  { slug: "nox", name: "Nox", imageUrl: image("NightFox"), elements: ["Dark"], partnerSkill: "Kuudere", shortEffect: "Detects nearby Pal Effigies." },
  { slug: "tombat", name: "Tombat", imageUrl: image("CatBat"), elements: ["Dark"], partnerSkill: "Ultrasonic Sensor", shortEffect: "Detects dungeons, treasure chests, and scrap." },
  { slug: "lunaris", name: "Lunaris", imageUrl: image("Mutant"), elements: ["Neutral"], partnerSkill: "Antigravity", shortEffect: "Adds carrying capacity and homing spheres." },
  { slug: "mimog", name: "Mimog", imageUrl: image("MimicDog"), elements: ["Neutral"], partnerSkill: "Master of Unlocking", shortEffect: "Opens treasure chests without keys." },
  { slug: "gobfin", name: "Gobfin", imageUrl: image("SharkKid"), elements: ["Water"], partnerSkill: "Angry Shark", shortEffect: "Increases player Attack while in the party." },
  { slug: "gobfin-ignis", name: "Gobfin Ignis", imageUrl: image("SharkKidFire"), elements: ["Fire"], partnerSkill: "Angry Shark", shortEffect: "Fire variant that increases player Attack." },
  { slug: "croajiro-noct", name: "Croajiro Noct", imageUrl: image("KendoFrogDark"), elements: ["Water", "Dark"], partnerSkill: "Shadow Stance", shortEffect: "Improves Dark weak-point damage." },
  { slug: "katress", name: "Katress", imageUrl: image("CatMage"), elements: ["Dark"], partnerSkill: "Mystical Black Magic", shortEffect: "Can preserve Pal Spheres during capture runs." },
  { slug: "fenglope-lux", name: "Fenglope Lux", imageUrl: image("FengyunDeeperElectric"), elements: ["Electric"], partnerSkill: "Stormcloud", shortEffect: "Increases drops from Water Pals." },
  { slug: "gumoss", name: "Gumoss", imageUrl: image("PlantSlime"), elements: ["Grass", "Ground"], partnerSkill: "Logging Assistance", shortEffect: "Reduces wood weight and improves logging." },
  { slug: "fuddler", name: "Fuddler", imageUrl: image("CuteMole"), elements: ["Ground"], partnerSkill: "Mining Assistance", shortEffect: "Reduces stone weight and improves mining." },
];

export const palBySlug = new Map(pals.map((pal) => [pal.slug, pal]));
