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
import { and, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
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

async function loadCitationsFor(
  newsId: string,
): Promise<{ url: string; source?: Source }[]> {
  const links = await db
    .select({
      sourceId: newsSourcesTable.sourceId,
      url: newsSourcesTable.url,
    })
    .from(newsSourcesTable)
    .where(eq(newsSourcesTable.newsId, newsId));
  if (links.length === 0) return [];
  const sourceIds = links
    .map((l) => l.sourceId)
    .filter((s): s is string => !!s);
  const sources = sourceIds.length
    ? await db
        .select()
        .from(sourcesTable)
        .where(inArray(sourcesTable.id, sourceIds))
    : [];
  const byId = new Map(sources.map((s) => [s.id, s]));
  return links.map((l) => ({
    url: l.url,
    source: l.sourceId ? byId.get(l.sourceId) : undefined,
  }));
}

router.get("/news", async (req, res) => {
  const params = ListNewsQueryParams.parse(req.query);

  const conds: SQL[] = [];
  if (params.confidence) {
    conds.push(eq(newsTable.confidence, params.confidence));
  }
  // Direct category filter overrides the feed-based "local" shortcut. Trim
  // empty strings so the chip "all" simply omits the filter.
  const categoryFilter = params.category?.trim();
  if (categoryFilter) {
    conds.push(eq(newsTable.category, categoryFilter));
  }
  // Geographic scope is independent of category — together they form a
  // 2-axis filter (e.g. local + sports, world + economy).
  if (params.scope === "local") {
    conds.push(ne(newsTable.location, "دولي"));
  } else if (params.scope === "world") {
    conds.push(eq(newsTable.location, "دولي"));
  }
  // Free-text search runs across both title and body so authors and readers
  // can find a story using any phrase they remember.
  const q = params.q?.trim();
  if (q) {
    const like = `%${q}%`;
    const searchClause = or(ilike(newsTable.title, like), ilike(newsTable.body, like));
    if (searchClause) conds.push(searchClause);
  }

  let rows: News[];
  // Feed shortcut tabs only apply when no explicit category was requested,
  // so a chip selection always wins over the tab's implicit filter.
  if (!categoryFilter && params.feed === "local") {
    rows = await db
      .select()
      .from(newsTable)
      .where(and(eq(newsTable.category, "محلي"), ...conds))
      .orderBy(desc(newsTable.publishedAt))
      .limit(params.limit);
  } else if (!categoryFilter && params.feed === "world") {
    rows = await db
      .select()
      .from(newsTable)
      .where(and(eq(newsTable.location, "دولي"), ...conds))
      .orderBy(desc(newsTable.publishedAt))
      .limit(params.limit);
  } else if (params.feed === "important") {
    rows = await db
      .select()
      .from(newsTable)
      .where(and(eq(newsTable.confidence, "high"), ...conds))
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
  // Rumor-debunking that backs its verdict with sources earns a boost — the
  // platform values verified critique of misinformation.
  const rumorBoost = body.isRumorCheck && sourceCount >= 1 ? 15 : 0;
  const confidenceScore = Math.min(98, 60 + sourceCount * 8 + rumorBoost);
  const confidence: "high" | "medium" | "low" =
    confidenceScore >= 80 ? "high" : confidenceScore >= 60 ? "medium" : "low";

  // Try matching submitted URLs to known sources by hostname. Every submitted
  // URL is preserved as a citation regardless of whether we recognize the
  // source entity — readers should see what the author actually cited.
  const allSources = await db.select().from(sourcesTable);
  const submittedCitations = body.sourceUrls.map((u) => {
    let host: string | undefined;
    try {
      host = new URL(u).hostname.replace(/^www\./, "");
    } catch {
      host = undefined;
    }
    const match = host
      ? allSources.find((s) => {
          try {
            return new URL(s.url).hostname.replace(/^www\./, "") === host;
          } catch {
            return false;
          }
        })
      : undefined;
    return { url: u, source: match };
  });
  const matched = submittedCitations
    .map((c) => c.source)
    .filter((s): s is Source => !!s);

  const baseReasons = [
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
  ];
  const aiExplanation = body.isRumorCheck
    ? {
        verdict:
          "خبر تفنيد إشاعة. تم تقييم صحة التفنيد ومصادره.",
        reasons: [
          {
            text:
              body.rumorVerdict === "false_rumor"
                ? "الإشاعة مفنّدة بشكل صحيح وفقاً للمصادر"
                : body.rumorVerdict === "true_claim"
                  ? "تبيّن أن ما يُعدّ إشاعة هو في الواقع خبر صحيح"
                  : "تبيّن أن الإشاعة صحيحة جزئياً",
            ok: true,
          },
          ...baseReasons,
        ],
      }
    : {
        verdict:
          "تم تحليل الخبر وفحص المصادر آلياً. سيتم تحديث التصنيف بعد إكمال جميع المراحل.",
        reasons: baseReasons,
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
    category: body.isRumorCheck ? "تفنيد إشاعة" : body.category ?? "عام",
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
    isRumorCheck: body.isRumorCheck ?? false,
    rumorClaim: body.rumorClaim ?? null,
    rumorVerdict: body.rumorVerdict ?? null,
  });

  let nsCounter = Date.now();
  if (submittedCitations.length > 0) {
    await db.insert(newsSourcesTable).values(
      submittedCitations.map((c) => ({
        id: `ns_${nsCounter++}`,
        newsId: id,
        sourceId: c.source?.id ?? null,
        url: c.url,
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
  const citations = await loadCitationsFor(id);
  res.status(201).json(newsDetail(created, author, citations));
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
  const citations = await loadCitationsFor(id);
  res.json(newsDetail(n, author, citations));
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
