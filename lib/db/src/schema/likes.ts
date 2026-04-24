import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";

export const likesTable = pgTable(
  "likes",
  {
    newsId: text("news_id").notNull(),
    userId: text("user_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.newsId, t.userId] })],
);
