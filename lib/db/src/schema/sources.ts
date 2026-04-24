import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const sourcesTable = pgTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  score: doublePrecision("score").notNull().default(50),
  type: text("type").notNull().default("website"),
  verified: boolean("verified").notNull().default(false),
  articlesCount: integer("articles_count").notNull().default(0),
  accuracyHistory: jsonb("accuracy_history").$type<number[]>().notNull().default([]),
  bio: text("bio"),
});

export type Source = typeof sourcesTable.$inferSelect;
export type InsertSource = typeof sourcesTable.$inferInsert;
