import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const commentsTable = pgTable("comments", {
  id: text("id").primaryKey(),
  newsId: text("news_id").notNull(),
  authorId: text("author_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Comment = typeof commentsTable.$inferSelect;
export type InsertComment = typeof commentsTable.$inferInsert;
