import type { Pal } from "./types";
import generatedPals from "./pals.generated.json";

export const pals: Pal[] = generatedPals;

export const palElements = [...new Set(pals.flatMap((pal) => pal.elements))].sort();

export const palBySlug = new Map(pals.map((pal) => [pal.slug, pal]));
