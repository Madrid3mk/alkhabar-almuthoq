import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  newsTable,
  newsSourcesTable,
  type News,
  type User,
} from "@workspace/db";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { GetUserParams, GetUserNewsParams } from "@workspace/api-zod";
import { newsCard, userProfile } from "../lib/mappers";

const router: IRouter = Router();
const ME_USER_ID = "user_0001";

async function trustTiers(me: User | undefined) {
  return [
    {
      name: "regular" as const,
      label: "عادي",
      description: "ابدأ مشوارك في النشر الموثوق.",
      color: "#94a3b8",
      requirements: [
        { text: "إكمال الملف الشخصي", met: true, progress: 100 },
        { text: "تأكيد البريد الإلكتروني", met: true, progress: 100 },
      ],
      perks: ["نشر الأخبار", "إضافة مصادر", "متابعة الناشرين"],
    },
    {
      name: "trusted" as const,
      label: "موثوق",
      description: "بعد سجل ثابت من الأخبار الصحيحة.",
      color: "#0ea5e9",
      requirements: [
        {
          text: "نشر 50 خبر موثوق",
          met: (me?.publishedCount ?? 0) >= 50,
          progress: Math.min(
            100,
            Math.round(((me?.publishedCount ?? 0) / 50) * 100),
          ),
        },
        {
          text: "نسبة دقة أعلى من 80%",
          met: (me?.accuracyScore ?? 0) >= 80,
          progress: Math.min(100, Math.round(me?.accuracyScore ?? 0)),
        },
        { text: "عدم نشر أي خبر خاطئ", met: true, progress: 100 },
      ],
      perks: [
        "علامة موثوق على الملف الشخصي",
        "ترجيح الأخبار في الفيد",
        "إمكانية الإبلاغ عن الأخبار الخاطئة",
      ],
    },
    {
      name: "verified_publisher" as const,
      label: "ناشر معتمد",
      description: "للناشرين الذين يصنعون فرقاً.",
      color: "#16a34a",
      requirements: [
        {
          text: "نشر 200 خبر موثوق",
          met: (me?.publishedCount ?? 0) >= 200,
          progress: Math.min(
            100,
            Math.round(((me?.publishedCount ?? 0) / 200) * 100),
          ),
        },
        {
          text: "نسبة دقة أعلى من 95%",
          met: (me?.accuracyScore ?? 0) >= 95,
          progress: Math.min(100, Math.round(me?.accuracyScore ?? 0)),
        },
        { text: "تفعيل المصادقة الثنائية", met: false, progress: 0 },
      ],
      perks: [
        "شارة ناشر معتمد",
        "أولوية في فيد الأخبار المهمة",
        "إمكانية ترشيح مصادر جديدة للنظام",
      ],
    },
  ];
}

router.get("/users/me", async (_req, res) => {
  const [u] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, ME_USER_ID));
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(userProfile(u));
});

router.get("/users/:id", async (req, res) => {
  const { id } = GetUserParams.parse(req.params);
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(userProfile(u));
});

router.get("/users/:id/news", async (req, res) => {
  const { id } = GetUserNewsParams.parse(req.params);
  const [author] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  if (!author) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const rows: News[] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.authorId, id))
    .orderBy(desc(newsTable.publishedAt))
    .limit(30);

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

  res.json(rows.map((n) => newsCard(n, author, counts.get(n.id) ?? 0)));
});

router.get("/trust-tiers", async (_req, res) => {
  const [me] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, ME_USER_ID));
  res.json(await trustTiers(me));
});

export default router;
