import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    discordId: text("discord_id").notNull(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("users_discord_id_idx").on(table.discordId)]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId), index("sessions_expires_at_idx").on(table.expiresAt)]
);

export const builds = sqliteTable(
  "builds",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    strategy: text("strategy").notNull(),
    passives: text("passives").notNull().default(""),
    baseSupport: text("base_support").notNull().default(""),
    tags: text("tags").notNull().default("[]"),
    gameVersion: text("game_version").notNull().default("1.0"),
    baseLikes: integer("base_likes").notNull().default(0),
    status: text("status").notNull().default("published"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("builds_slug_idx").on(table.slug),
    index("builds_category_idx").on(table.category),
    index("builds_created_at_idx").on(table.createdAt),
  ]
);

export const buildPals = sqliteTable(
  "build_pals",
  {
    id: text("id").primaryKey(),
    buildId: text("build_id").notNull().references(() => builds.id, { onDelete: "cascade" }),
    slot: integer("slot").notNull(),
    palSlug: text("pal_slug").notNull(),
    palName: text("pal_name").notNull(),
    imageUrl: text("image_url").notNull(),
    role: text("role").notNull().default(""),
    partnerSkill: text("partner_skill").notNull().default(""),
    stackNote: text("stack_note").notNull().default(""),
  },
  (table) => [index("build_pals_build_id_idx").on(table.buildId)]
);

export const likes = sqliteTable(
  "likes",
  {
    buildId: text("build_id").notNull().references(() => builds.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.buildId, table.userId] }),
    index("likes_build_id_idx").on(table.buildId),
    index("likes_user_id_idx").on(table.userId),
  ]
);
