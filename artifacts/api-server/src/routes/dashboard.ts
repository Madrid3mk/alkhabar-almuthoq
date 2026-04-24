import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  newsTable,
  newsSourcesTable,
  usersTable,
  type News,
} from "@workspace/db";
import { desc, eq, gte, inArray, sql } from "drizzle-orm";
import { newsCard } from "../lib/mappers";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [{ totalNews }] = await db
    .select({ totalNews: sql<number>`COUNT(*)::int` })
    .from(newsTable);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [{ verifiedToday }] = await db
    .select({ verifiedToday: sql<number>`COUNT(*)::int` })
    .from(newsTable)
    .where(
      sql`${newsTable.status} = 'verified' AND ${newsTable.publishedAt} >= ${dayAgo}`,
    );

  const [{ rejectedToday }] = await db
    .select({ rejectedToday: sql<number>`COUNT(*)::int` })
    .from(newsTable)
    .where(
      sql`${newsTable.status} = 'rejected' AND ${newsTable.publishedAt} >= ${dayAgo}`,
    );

  const [{ activePublishers }] = await db
    .select({
      activePublishers: sql<number>`COUNT(DISTINCT ${newsTable.authorId})::int`,
    })
    .from(newsTable)
    .where(gte(newsTable.publishedAt, dayAgo));

  const [{ averageConfidence }] = await db
    .select({
      averageConfidence: sql<number>`COALESCE(AVG(${newsTable.confidenceScore}), 0)`,
    })
    .from(newsTable);

  const dist = await db
    .select({
      confidence: newsTable.confidence,
      c: sql<number>`COUNT(*)::int`,
    })
    .from(newsTable)
    .groupBy(newsTable.confidence);
  const trustDistribution = { high: 0, medium: 0, low: 0 };
  for (const r of dist) {
    if (r.confidence === "high") trustDistribution.high = r.c;
    else if (r.confidence === "medium") trustDistribution.medium = r.c;
    else if (r.confidence === "low") trustDistribution.low = r.c;
  }

  const cats = await db
    .select({
      name: newsTable.category,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(newsTable)
    .groupBy(newsTable.category)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

  res.json({
    totalNews,
    verifiedToday,
    rejectedToday,
    activePublishers,
    averageConfidence: Math.round(averageConfidence),
    trustDistribution,
    topCategories: cats.map((c) => ({ name: c.name, count: c.count })),
  });
});

router.get("/dashboard/trending", async (_req, res) => {
  const rows: News[] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.status, "verified"))
    .orderBy(desc(newsTable.likes), desc(newsTable.publishedAt))
    .limit(10);

  const authors = await db
    .select()
    .from(usersTable)
    .where(
      inArray(
        usersTable.id,
        Array.from(new Set(rows.map((r) => r.authorId))),
      ),
    );
  const byId = new Map(authors.map((a) => [a.id, a]));

  const counts = await (async () => {
    if (rows.length === 0) return new Map<string, number>();
    const r = await db
      .select({
        newsId: newsSourcesTable.newsId,
        c: sql<number>`COUNT(*)::int`,
      })
      .from(newsSourcesTable)
      .where(
        inArray(
          newsSourcesTable.newsId,
          rows.map((n) => n.id),
        ),
      )
      .groupBy(newsSourcesTable.newsId);
    return new Map(r.map((x) => [x.newsId, x.c]));
  })();

  res.json(
    rows
      .map((n) => {
        const a = byId.get(n.authorId);
        if (!a) return null;
        return newsCard(n, a, counts.get(n.id) ?? 0);
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  );
});

export default router;
