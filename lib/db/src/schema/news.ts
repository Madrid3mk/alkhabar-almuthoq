import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export type AiExplanation = {
  verdict: string;
  reasons: { text: string; ok: boolean }[];
};

export type Claim = { text: string; supported: boolean };

export const newsTable = pgTable("news", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("verifying"),
  confidence: text("confidence").notNull().default("medium"),
  confidenceScore: doublePrecision("confidence_score").notNull().default(0),
  category: text("category").notNull().default("عام"),
  location: text("location"),
  authorId: text("author_id").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  verificationStartedAt: timestamp("verification_started_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  verificationDurationSeconds: integer("verification_duration_seconds")
    .notNull()
    .default(120),
  aiExplanation: jsonb("ai_explanation").$type<AiExplanation>().notNull(),
  claims: jsonb("claims").$type<Claim[]>().notNull().default([]),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  isRumorCheck: boolean("is_rumor_check").notNull().default(false),
  rumorClaim: text("rumor_claim"),
  rumorVerdict: text("rumor_verdict"),
});

export const newsSourcesTable = pgTable("news_sources", {
  id: text("id").primaryKey(),
  newsId: text("news_id").notNull(),
  sourceId: text("source_id"),
  url: text("url").notNull().default(""),
});

export type News = typeof newsTable.$inferSelect;
export type InsertNews = typeof newsTable.$inferInsert;
export type NewsSource = typeof newsSourcesTable.$inferSelect;
export type InsertNewsSource = typeof newsSourcesTable.$inferInsert;
