export const categories = ["Combat", "Breeding", "Fishing", "Exploration", "Farming"] as const;

export type Category = (typeof categories)[number];

export type Pal = {
  slug: string;
  name: string;
  imageUrl: string;
  elements: string[];
  partnerSkill: string;
  shortEffect: string;
};

export type BuildPal = Pal & {
  role: string;
  stackNote?: string;
};

export type BuildAuthor = {
  name: string;
  avatarUrl?: string;
};

export type PartyBuild = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  summary: string;
  strategy: string;
  passives: string;
  baseSupport: string;
  tags: string[];
  gameVersion: string;
  pals: BuildPal[];
  likes: number;
  likedByViewer?: boolean;
  author: BuildAuthor;
  createdAt: number;
};

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};
