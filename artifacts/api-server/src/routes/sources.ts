import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  sourcesTable,
  newsTable,
  newsSourcesTable,
  usersTable,
  type Source,
  type News,
  type User,
} from "@workspace/db";
import { desc, eq, ilike, inArray, sql } from "drizzle-orm";
import {
  ListSourcesQueryParams,
  GetSourceParams,
} from "@workspace/api-zod";
import { newsCard, sourceFull, sourceMini } from "../lib/mappers";

const router: IRouter = Router();

router.get("/sources/leaderboard", async (_req, res) => {
  const rows = await db
    .select()
    .from(sourcesTable)
    .orderBy(desc(sourcesTable.score))
    .limit(10);
  res.json(rows.map(sourceFull));
});

router.get("/sources", async (req, res) => {
  const params = ListSourcesQueryParams.parse(req.query);

  let rows: Source[];
  if (params.q) {
    rows = await db
      .select()
      .from(sourcesTable)
      .where(ilike(sourcesTable.name, `%${params.q}%`))
      .orderBy(desc(sourcesTable.score));
  } else if (params.type === "trusted") {
    rows = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.verified, true))
      .orderBy(desc(sourcesTable.score));
  } else if (params.type === "newspapers") {
    rows = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.type, "newspaper"))
      .orderBy(desc(sourcesTable.score));
  } else if (params.type === "channels") {
    rows = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.type, "tv_channel"))
      .orderBy(desc(sourcesTable.score));
  } else if (params.type === "websites") {
    rows = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.type, "website"))
      .orderBy(desc(sourcesTable.score));
  } else {
    rows = await db
      .select()
      .from(sourcesTable)
      .orderBy(desc(sourcesTable.score));
  }
  res.json(rows.map(sourceFull));
});

router.get("/sources/:id", async (req, res) => {
  const { id } = GetSourceParams.parse(req.params);
  const [src] = await db
    .select()
    .from(sourcesTable)
    .where(eq(sourcesTable.id, id));
  if (!src) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const links = await db
    .select({ newsId: newsSourcesTable.newsId })
    .from(newsSourcesTable)
    .where(eq(newsSourcesTable.sourceId, id))
    .limit(20);

  let recent: News[] = [];
  let authors: User[] = [];
  if (links.length > 0) {
    recent = await db
      .select()
      .from(newsTable)
      .where(
        inArray(
          newsTable.id,
          links.map((l) => l.newsId),
        ),
      )
      .orderBy(desc(newsTable.publishedAt))
      .limit(10);
    if (recent.length > 0) {
      authors = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.id, recent.map((r) => r.authorId)));
    }
  }

  const counts = await (async () => {
    if (recent.length === 0) return new Map<string, number>();
    const r = await db
      .select({
        newsId: newsSourcesTable.newsId,
        c: sql<number>`COUNT(*)::int`,
      })
      .from(newsSourcesTable)
      .where(
        inArray(
          newsSourcesTable.newsId,
          recent.map((n) => n.id),
        ),
      )
      .groupBy(newsSourcesTable.newsId);
    return new Map(r.map((x) => [x.newsId, x.c]));
  })();

  const authorById = new Map(authors.map((a) => [a.id, a]));
  const recentNews = recent
    .map((n) => {
      const a = authorById.get(n.authorId);
      if (!a) return null;
      return newsCard(n, a, counts.get(n.id) ?? 0);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const related = await db
    .select()
    .from(sourcesTable)
    .where(eq(sourcesTable.type, src.type))
    .orderBy(desc(sourcesTable.score))
    .limit(5);

  res.json({
    ...sourceFull(src),
    bio: src.bio ?? "",
    recentNews,
    relatedSources: related.filter((r) => r.id !== src.id).map(sourceMini),
  });
});

export default router;
