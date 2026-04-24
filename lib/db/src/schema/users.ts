import { pgTable, text, integer, doublePrecision } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  tier: text("tier").notNull().default("regular"),
  accuracyScore: doublePrecision("accuracy_score").notNull().default(0),
  consistencyScore: doublePrecision("consistency_score").notNull().default(0),
  publishedCount: integer("published_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  followers: integer("followers").notNull().default(0),
  following: integer("following").notNull().default(0),
  progressToNextTier: doublePrecision("progress_to_next_tier")
    .notNull()
    .default(0),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
