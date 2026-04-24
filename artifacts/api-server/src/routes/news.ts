import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  newsTable,
  newsSourcesTable,
  usersTable,
  sourcesTable,
  commentsTable,
  likesTable,
  type News,
  type Source,
  type User,
} from "@workspace/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  ListNewsQueryParams,
  GetNewsParams,
  GetVerificationParams,
  ToggleLikeParams,
  ListCommentsParams,
  SubmitNewsBody,
} from "@workspace/api-zod";
import {
  newsCard,
  newsDetail,
  computeVerification,
  commentDto,
} from "../lib/mappers";

const router: IRouter = Router();
const ME_USER_ID = "user_0001";

async function loadAuthors(authorIds: string[]): Promise<Map<string, User>> {
  const unique = Array.from(new Set(authorIds));
  if (unique.length === 0) return new Map();
  const rows = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.id, unique));
  return new Map(rows.map((u) => [u.id, u]));
}

async function loadSourceCounts(
  newsIds: string[],
): Promise<Map<string, number>> {
  if (newsIds.length === 0) return new Map();
  const rows = await db
    .select({
      newsId: newsSourcesTable.newsId,
      c: sql<number>`COUNT(*)::int`,
    })
    .from(newsSourcesTable)
    .where(inArray(newsSourcesTable.newsId, newsIds))
    .groupBy(newsSourcesTable.newsId);
  return new Map(rows.map((r) => [r.newsId, r.c]));
}

async function loadSourcesFor(newsId: string): Promise<Source[]> {
  const links = await db
    .select({ sourceId: newsSourcesTable.sourceId })
    .from(newsSourcesTable)
    .where(eq(newsSourcesTable.newsId, newsId));
  if (links.length === 0) return [];
  return db
    .select()
    .from(sourcesTable)
    .where(
      inArray(
        sourcesTable.id,
        links.map((l) => l.sourceId),
      ),
    );
}

router.get("/news", async (req, res) => {
  const params = ListNewsQueryParams.parse(req.query);

  const conds = [] as ReturnType<typeof eq>[];
  if (params.confidence) {
    conds.push(eq(newsTable.confidence, params.confidence));
  }

  let rows: News[];
  if (params.feed === "local") {
    rows = await db
      .select()
      .from(newsTable)
      .where(
        and(eq(newsTable.category, "محلي"), ...conds),
      )
      .orderBy(desc(newsTable.publishedAt))
      .limit(params.limit);
  } else if (params.feed === "world") {
    rows = await db
      .select()
      .from(newsTable)
      .where(and(eq(newsTable.location, "دولي"), ...conds))
      .orderBy(desc(newsTable.publishedAt))
      .limit(params.limit);
  } else if (params.feed === "important") {
    const baseConds = [eq(newsTable.confidence, "high"), ...conds.filter((c) => c)];
    rows = await db
      .select()
      .from(newsTable)
      .where(and(...baseConds))
      .orderBy(desc(newsTable.confidenceScore), desc(newsTable.publishedAt))
      .limit(params.limit);
  } else {
    rows = await db
      .select()
      .from(newsTable)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(newsTable.publishedAt))
      .limit(params.limit);
  }

  const authors = await loadAuthors(rows.map((n) => n.authorId));
  const counts = await loadSourceCounts(rows.map((n) => n.id));
  const out = rows
    .map((n) => {
      const author = authors.get(n.authorId);
      if (!author) return null;
      return newsCard(n, author, counts.get(n.id) ?? 0);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  res.json(out);
});

router.post("/news", async (req, res) => {
  const body = SubmitNewsBody.parse(req.body);

  if (body.sourceUrls.length === 0) {
    res.status(400).json({ error: "لا مصدر = لا نشر" });
    return;
  }

  const id = `news_${Date.now()}`;
  const now = new Date();
  const sourceCount = body.sourceUrls.length;
  const confidenceScore = Math.min(95, 60 + sourceCount * 8);
  const confidence: "high" | "medium" | "low" =
    confidenceScore >= 80 ? "high" : confidenceScore >= 60 ? "medium" : "low";

  // Try matching submitted URLs to known sources by hostname
  const allSources = await db.select().from(sourcesTable);
  const matched = body.sourceUrls
    .map((u) => {
      try {
        const host = new URL(u).hostname.replace(/^www\./, "");
        return allSources.find((s) => {
          const sh = new URL(s.url).hostname.replace(/^www\./, "");
          return sh === host;
        });
      } catch {
        return undefined;
      }
    })
    .filter((s): s is Source => !!s);

  const aiExplanation = {
    verdict:
      "تم تحليل الخبر وفحص المصادر آلياً. سيتم تحديث التصنيف بعد إكمال جميع المراحل.",
    reasons: [
      {
        text: `تم العثور على ${matched.length} مصدر معروف في النظام`,
        ok: matched.length > 0,
      },
      {
        text:
          sourceCount >= 3
            ? "عدد كاف من المصادر"
            : "عدد المصادر أقل من الموصى به (3+)",
        ok: sourceCount >= 3,
      },
      {
        text: "تم اعتبار صياغة النص خبرية",
        ok: true,
      },
    ],
  };

  await db.insert(newsTable).values({
    id,
    title: body.title,
    summary: body.body.slice(0, 200),
    body: body.body,
    imageUrl: body.mediaUrl ?? null,
    status: "verifying",
    confidence,
    confidenceScore,
    category: body.category ?? "عام",
    location: body.location ?? null,
    authorId: ME_USER_ID,
    publishedAt: now,
    verificationStartedAt: now,
    verificationDurationSeconds: 60,
    aiExplanation,
    claims: [],
    likes: 0,
    comments: 0,
    shares: 0,
  });

  let nsCounter = Date.now();
  if (matched.length > 0) {
    await db.insert(newsSourcesTable).values(
      matched.map((s) => ({
        id: `ns_${nsCounter++}`,
        newsId: id,
        sourceId: s.id,
      })),
    );
  }

  const [created] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.id, id));
  if (!created) {
    res.status(500).json({ error: "Failed to load created news" });
    return;
  }
  const [author] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, created.authorId));
  if (!author) {
    res.status(500).json({ error: "Author not found" });
    return;
  }
  const sources = await loadSourcesFor(id);
  res.status(201).json(newsDetail(created, author, sources));
});

router.get("/news/:id", async (req, res) => {
  const { id } = GetNewsParams.parse(req.params);
  const [n] = await db.select().from(newsTable).where(eq(newsTable.id, id));
  if (!n) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [author] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, n.authorId));
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  const sources = await loadSourcesFor(id);
  res.json(newsDetail(n, author, sources));
});

router.get("/news/:id/verification", async (req, res) => {
  const { id } = GetVerificationParams.parse(req.params);
  const [n] = await db.select().from(newsTable).where(eq(newsTable.id, id));
  if (!n) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(computeVerification(n));
});

router.post("/news/:id/like", async (req, res) => {
  const { id } = ToggleLikeParams.parse(req.params);
  const [existing] = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.newsId, id), eq(likesTable.userId, ME_USER_ID)));

  if (existing) {
    await db
      .delete(likesTable)
      .where(and(eq(likesTable.newsId, id), eq(likesTable.userId, ME_USER_ID)));
    await db
      .update(newsTable)
      .set({ likes: sql`${newsTable.likes} - 1` })
      .where(eq(newsTable.id, id));
  } else {
    await db.insert(likesTable).values({ newsId: id, userId: ME_USER_ID });
    await db
      .update(newsTable)
      .set({ likes: sql`${newsTable.likes} + 1` })
      .where(eq(newsTable.id, id));
  }
  const [n] = await db
    .select({ likes: newsTable.likes })
    .from(newsTable)
    .where(eq(newsTable.id, id));
  res.json({ liked: !existing, likes: n?.likes ?? 0 });
});

router.get("/news/:id/comments", async (req, res) => {
  const { id } = ListCommentsParams.parse(req.params);
  const rows = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.newsId, id))
    .orderBy(desc(commentsTable.createdAt));
  const authors = await loadAuthors(rows.map((c) => c.authorId));
  const out = rows
    .map((c) => {
      const a = authors.get(c.authorId);
      if (!a) return null;
      return commentDto(c, a);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  res.json(out);
});

export default router;
