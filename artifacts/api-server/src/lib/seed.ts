import { db } from "@workspace/db";
import {
  usersTable,
  sourcesTable,
  newsTable,
  newsSourcesTable,
  commentsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

function id(prefix: string, n: number): string {
  return `${prefix}_${n.toString().padStart(4, "0")}`;
}

export async function ensureSeed(): Promise<void> {
  const existing = await db.execute(sql`SELECT COUNT(*)::int AS c FROM news`);
  const count = (existing.rows[0] as { c: number }).c;
  if (count > 0) {
    logger.info({ count }, "Seed already present, skipping");
    return;
  }
  logger.info("Seeding initial data");

  const users = [
    {
      id: id("user", 1),
      name: "أحمد محمد",
      handle: "ahmed_news",
      avatarUrl: null,
      bio: "ناشر موثوق متخصص في الأخبار المحلية والاقتصادية.",
      tier: "trusted",
      accuracyScore: 92,
      consistencyScore: 88,
      publishedCount: 128,
      correctCount: 118,
      followers: 4280,
      following: 132,
      progressToNextTier: 64,
    },
    {
      id: id("user", 2),
      name: "ريم الحسن",
      handle: "reem_h",
      avatarUrl: null,
      bio: "مراسلة دولية، أركز على قضايا المناخ والطاقة.",
      tier: "verified_publisher",
      accuracyScore: 96,
      consistencyScore: 94,
      publishedCount: 312,
      correctCount: 305,
      followers: 18420,
      following: 87,
      progressToNextTier: 100,
    },
    {
      id: id("user", 3),
      name: "خالد العتيبي",
      handle: "khalid_o",
      avatarUrl: null,
      bio: "محرر علمي.",
      tier: "regular",
      accuracyScore: 71,
      consistencyScore: 65,
      publishedCount: 18,
      correctCount: 13,
      followers: 240,
      following: 80,
      progressToNextTier: 28,
    },
    {
      id: id("user", 4),
      name: "ليلى ناصر",
      handle: "laila_n",
      avatarUrl: null,
      bio: "متابعة شؤون اقتصادية.",
      tier: "trusted",
      accuracyScore: 87,
      consistencyScore: 81,
      publishedCount: 64,
      correctCount: 56,
      followers: 1820,
      following: 210,
      progressToNextTier: 42,
    },
  ];
  await db.insert(usersTable).values(users);

  const sources = [
    {
      id: id("src", 1),
      name: "رويترز",
      url: "https://reuters.com",
      score: 95,
      type: "news_agency",
      verified: true,
      articlesCount: 4820,
      accuracyHistory: [92, 93, 94, 95, 95, 95, 96],
      bio: "وكالة أنباء عالمية.",
    },
    {
      id: id("src", 2),
      name: "العربية",
      url: "https://alarabiya.net",
      score: 93,
      type: "tv_channel",
      verified: true,
      articlesCount: 3120,
      accuracyHistory: [88, 90, 91, 92, 93, 93, 93],
      bio: "قناة إخبارية عربية.",
    },
    {
      id: id("src", 3),
      name: "وكالة الأنباء السعودية",
      url: "https://spa.gov.sa",
      score: 94,
      type: "official",
      verified: true,
      articlesCount: 2210,
      accuracyHistory: [93, 94, 94, 95, 94, 94, 94],
      bio: "الوكالة الرسمية للأنباء.",
    },
    {
      id: id("src", 4),
      name: "صحيفة عكاظ",
      url: "https://okaz.com.sa",
      score: 88,
      type: "newspaper",
      verified: true,
      articlesCount: 1520,
      accuracyHistory: [85, 86, 87, 88, 88, 89, 88],
      bio: "صحيفة سعودية.",
    },
    {
      id: id("src", 5),
      name: "قناة الإخبارية",
      url: "https://ekhbariya.net",
      score: 90,
      type: "tv_channel",
      verified: true,
      articlesCount: 1840,
      accuracyHistory: [86, 88, 89, 90, 90, 90, 91],
      bio: "قناة إخبارية رسمية.",
    },
    {
      id: id("src", 6),
      name: "وزارة الصحة",
      url: "https://moh.gov.sa",
      score: 97,
      type: "official",
      verified: true,
      articlesCount: 980,
      accuracyHistory: [95, 96, 96, 97, 97, 97, 97],
      bio: "المصدر الرسمي لوزارة الصحة.",
    },
    {
      id: id("src", 7),
      name: "AP",
      url: "https://apnews.com",
      score: 94,
      type: "news_agency",
      verified: true,
      articlesCount: 5320,
      accuracyHistory: [92, 93, 94, 94, 94, 95, 94],
      bio: "Associated Press.",
    },
    {
      id: id("src", 8),
      name: "بلومبرغ",
      url: "https://bloomberg.com",
      score: 92,
      type: "news_agency",
      verified: true,
      articlesCount: 4120,
      accuracyHistory: [90, 91, 92, 92, 92, 93, 92],
      bio: "تغطية اقتصادية.",
    },
  ];
  await db.insert(sourcesTable).values(sources);

  const now = Date.now();
  const minutes = (m: number) => new Date(now - m * 60 * 1000);

  const news = [
    {
      id: id("news", 1),
      title: "اندلاع حريق ضخم في مستودع نفط في مدينة جدة صباح اليوم",
      summary:
        "تم العثور على 4 مصادر مستقلة تؤكد هذا الخبر، مع تغطية مباشرة من الأرض ومصادر رسمية.",
      body: "أفادت السلطات في مدينة جدة باندلاع حريق ضخم في أحد مستودعات النفط في المنطقة الصناعية صباح اليوم. الدفاع المدني يعمل على إخماد الحريق ولم تُسجَّل إصابات حتى اللحظة. تم إخلاء المباني المجاورة كإجراء احترازي.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 92,
      category: "محلي",
      location: "جدة",
      authorId: id("user", 1),
      publishedAt: minutes(15),
      verificationStartedAt: minutes(20),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict: "تم تصنيف هذا الخبر كمؤكد بناءً على مطابقة المحتوى مع 4 مصادر موثوقة.",
        reasons: [
          { text: "تطابق محتوى الخبر مع 4 مصادر موثوقة", ok: true },
          { text: "المصادر مستقلة عن بعضها", ok: true },
          { text: "لا توجد تناقضات في المعلومات", ok: true },
          { text: "المصدر الأساسي ذو موثوقية عالية", ok: true },
        ],
      },
      claims: [
        { text: "اندلع حريق في مستودع نفط بجدة صباح اليوم", supported: true },
        { text: "الدفاع المدني يعمل على إخماد الحريق", supported: true },
        { text: "لم تسجل إصابات بشرية", supported: true },
      ],
      likes: 1240,
      comments: 128,
      shares: 342,
    },
    {
      id: id("news", 2),
      title: "توقعات بتأثر عدة دول بموجة حرارة غير مسبوقة الأسبوع القادم",
      summary:
        "مصدران رئيسيان يشيران إلى موجة حرارة شديدة، لكن تباين البيانات يتطلب تحقيقًا إضافيًا.",
      body: "أصدرت هيئات الأرصاد في عدد من دول الخليج تنبيهات بموجة حر غير مسبوقة من المتوقع أن تضرب المنطقة خلال الأسبوع القادم، مع توقعات بتسجيل درجات حرارة قياسية في بعض المدن.",
      imageUrl: null,
      status: "unverified",
      confidence: "medium",
      confidenceScore: 58,
      category: "طقس",
      location: "العالم العربي",
      authorId: id("user", 4),
      publishedAt: minutes(45),
      verificationStartedAt: minutes(50),
      verificationDurationSeconds: 120,
      aiExplanation: {
        verdict: "تم تصنيف هذا الخبر كغير مؤكد بسبب الاعتماد على مصدرين فقط ووجود تباين في الأرقام.",
        reasons: [
          { text: "مصدران متاحان، أقل من العدد الموصى به", ok: false },
          { text: "تباين بسيط بين الأرقام المُذكورة", ok: false },
          { text: "صياغة الخبر خبرية لا رأي", ok: true },
          { text: "المصادر معتمدة سابقاً", ok: true },
        ],
      },
      claims: [
        { text: "موجة حرارة غير مسبوقة الأسبوع القادم", supported: false },
        { text: "إصدار تنبيهات من هيئات الأرصاد", supported: true },
      ],
      likes: 420,
      comments: 64,
      shares: 96,
    },
    {
      id: id("news", 3),
      title: "وزارة الصحة تعلن عن اكتشاف لقاح جديد لفيروس كورونا",
      summary:
        "أعلنت وزارة الصحة اليوم عن اكتشاف لقاح جديد لفيروس كورونا بعد نجاح التجارب السريرية الأولية.",
      body: "أعلنت وزارة الصحة اليوم عن اكتشاف لقاح جديد لفيروس كورونا بعد نجاح التجارب السريرية الأولية على مجموعة من المتطوعين. وأكدت الوزارة أن النتائج الأولية مبشرة وتظهر فعالية عالية وأمان مقبول.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 89,
      category: "صحة",
      location: "الرياض",
      authorId: id("user", 2),
      publishedAt: minutes(180),
      verificationStartedAt: minutes(185),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict: "تم تأكيد الخبر بناءً على المصدر الرسمي للوزارة وتغطية وكالات أنباء معتمدة.",
        reasons: [
          { text: "المصدر الأساسي رسمي (وزارة الصحة)", ok: true },
          { text: "تغطية من 3 مصادر إضافية", ok: true },
          { text: "صياغة الخبر خبرية لا رأي", ok: true },
        ],
      },
      claims: [
        { text: "إعلان وزارة الصحة عن لقاح جديد", supported: true },
        { text: "نجاح التجارب السريرية الأولية", supported: true },
      ],
      likes: 2210,
      comments: 184,
      shares: 510,
    },
    {
      id: id("news", 4),
      title: "ارتفاع أسعار النفط بنسبة 3% في تعاملات اليوم",
      summary:
        "ارتفاع ملحوظ في أسعار النفط الخام مع توقعات بقرارات أوبك+ القادمة.",
      body: "ارتفعت أسعار النفط الخام بنسبة 3% في تعاملات اليوم وسط توقعات بقرارات تخفيض إنتاج جديدة من تحالف أوبك+. وأشار المحللون إلى أن السوق يستجيب أيضاً لتراجع المخزونات الأمريكية.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 88,
      category: "اقتصاد",
      location: "دولي",
      authorId: id("user", 4),
      publishedAt: minutes(60),
      verificationStartedAt: minutes(65),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict: "تطابقت بيانات الأسعار مع مصادر مالية موثوقة.",
        reasons: [
          { text: "تطابق الأرقام مع 3 مصادر مالية", ok: true },
          { text: "المصادر متخصصة في الأسواق", ok: true },
          { text: "لا تباين في البيانات", ok: true },
        ],
      },
      claims: [
        { text: "ارتفاع أسعار النفط 3%", supported: true },
        { text: "تراجع المخزونات الأمريكية", supported: true },
      ],
      likes: 870,
      comments: 92,
      shares: 188,
    },
    {
      id: id("news", 5),
      title: "اكتشاف أثري نادر يعود إلى أكثر من 2000 عام في شمال المملكة",
      summary: "بعثة أثرية تعلن عن اكتشاف موقع جديد قد يعيد كتابة التاريخ المحلي.",
      body: "أعلنت بعثة أثرية عن اكتشاف موقع جديد يعود إلى أكثر من 2000 عام في شمال المملكة، ما قد يعيد كتابة فصول من تاريخ الجزيرة العربية. وستستمر أعمال التنقيب الأشهر القادمة.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 84,
      category: "ثقافة",
      location: "تبوك",
      authorId: id("user", 3),
      publishedAt: minutes(300),
      verificationStartedAt: minutes(305),
      verificationDurationSeconds: 100,
      aiExplanation: {
        verdict: "تأكدت تفاصيل الاكتشاف من خلال مصادر رسمية ومتخصصة.",
        reasons: [
          { text: "تأكيد من هيئة التراث", ok: true },
          { text: "تغطية وكالة الأنباء الرسمية", ok: true },
          { text: "لا تناقضات", ok: true },
        ],
      },
      claims: [
        { text: "اكتشاف أثري عمره 2000 عام", supported: true },
        { text: "في شمال المملكة", supported: true },
      ],
      likes: 540,
      comments: 47,
      shares: 120,
    },
    {
      id: id("news", 6),
      title: "إشاعة منتشرة على وسائل التواصل تم تفنيدها من قبل المصادر الرسمية",
      summary: "تحقق من خبر متداول حول قرارات حكومية مزعومة لم تصدر فعلياً.",
      body: "انتشرت في الساعات الماضية إشاعة عبر وسائل التواصل الاجتماعي حول قرارات حكومية مزعومة، وقد فنّدت المصادر الرسمية هذا الخبر بشكل قاطع.",
      imageUrl: null,
      status: "rejected",
      confidence: "low",
      confidenceScore: 22,
      category: "محلي",
      location: "الرياض",
      authorId: id("user", 3),
      publishedAt: minutes(120),
      verificationStartedAt: minutes(125),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict: "رفض الخبر لعدم وجود أي مصدر رسمي يدعمه.",
        reasons: [
          { text: "لا يوجد مصدر رسمي يؤكد الخبر", ok: false },
          { text: "تكذيب من المصدر الرسمي المعني", ok: false },
          { text: "صياغة قريبة من الرأي/الإثارة", ok: false },
        ],
      },
      claims: [
        { text: "صدور قرار حكومي بهذا الشأن", supported: false },
      ],
      likes: 12,
      comments: 38,
      shares: 4,
    },
    {
      id: id("news", 8),
      title: "تفنيد إشاعة: الحكومة الأردنية لم تُحوّل التعليم إلى تعليم عن بُعد",
      summary:
        "إشاعة منتشرة تدّعي تحويل المدارس والجامعات في الأردن إلى التعليم عن بُعد، وقد فنّدتها وزارة التربية والتعليم رسمياً.",
      body: "انتشرت في الساعات الأخيرة إشاعة على وسائل التواصل تدّعي أن الحكومة الأردنية قررت تحويل التعليم في المدارس والجامعات إلى تعليم عن بُعد بدءاً من الأسبوع القادم. وقد نفت وزارة التربية والتعليم الأردنية هذا الادعاء في بيان رسمي، مؤكدةً أن الدوام يسير بشكل اعتيادي وأنه لا توجد أي قرارات بهذا الشأن. كما أكدت وزارة التعليم العالي للجامعات أن لا تغيير في نمط الدراسة.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 94,
      category: "تفنيد إشاعة",
      location: "عمّان",
      authorId: id("user", 2),
      publishedAt: minutes(35),
      verificationStartedAt: minutes(40),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict:
          "تم تأكيد أن الادعاء المتداول إشاعة غير صحيحة، وفقاً لبيانات رسمية من الوزارة المعنية.",
        reasons: [
          { text: "تكذيب رسمي من وزارة التربية والتعليم", ok: true },
          { text: "تأكيد من وزارة التعليم العالي", ok: true },
          { text: "لا يوجد أي مصدر رسمي يدعم الإشاعة", ok: true },
          { text: "تغطية متعددة من مصادر إخبارية موثوقة", ok: true },
        ],
      },
      claims: [
        {
          text: "الادعاء بتحويل التعليم إلى تعليم عن بُعد",
          supported: false,
        },
        { text: "تكذيب وزارة التربية للإشاعة", supported: true },
        { text: "تأكيد استمرار الدوام الاعتيادي", supported: true },
      ],
      likes: 1840,
      comments: 312,
      shares: 720,
      isRumorCheck: true,
      rumorClaim:
        "الحكومة الأردنية قررت تحويل التعليم في المدارس والجامعات إلى تعليم عن بُعد بدءاً من الأسبوع القادم.",
      rumorVerdict: "false_rumor",
    },
    {
      id: id("news", 9),
      title: "اتفاقية تعاون اقتصادي جديدة بين الأردن ومصر في قطاع الطاقة المتجددة",
      summary:
        "وقّع وزيرا الطاقة في البلدين اتفاقية لتطوير مشاريع الطاقة الشمسية المشتركة بقيمة تتجاوز ٢٠٠ مليون دولار.",
      body: "أعلن وزير الطاقة الأردني ونظيره المصري في مؤتمر صحفي مشترك عن توقيع اتفاقية تعاون استراتيجية تشمل تطوير ثلاث محطات للطاقة الشمسية بطاقة إجمالية تصل إلى ٤٠٠ ميجاواط خلال السنوات الثلاث القادمة. وأكد الوزيران أن الاتفاقية تأتي في إطار توجه البلدين نحو تنويع مصادر الطاقة وتقليل الاعتماد على الوقود الأحفوري. كما تتضمن الاتفاقية تبادل الخبرات الفنية وتدريب الكوادر البشرية المتخصصة.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 91,
      category: "سياسة",
      location: "عمّان",
      authorId: id("user", 2),
      publishedAt: minutes(180),
      verificationStartedAt: minutes(185),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict: "اتفاقية موثقة من المصادر الرسمية في كلا البلدين.",
        reasons: [
          { text: "بيان رسمي من وزارة الطاقة الأردنية", ok: true },
          { text: "تأكيد من وكالات الأنباء الدولية", ok: true },
          { text: "وثائق الاتفاقية متاحة للعموم", ok: true },
        ],
      },
      claims: [
        { text: "توقيع اتفاقية بقيمة ٢٠٠ مليون دولار", supported: true },
        { text: "إنشاء ٣ محطات بطاقة ٤٠٠ ميجاواط", supported: true },
      ],
      likes: 1320,
      comments: 184,
      shares: 412,
    },
    {
      id: id("news", 10),
      title: "النشامى يفوز على أستراليا ٢-١ في تصفيات كأس آسيا",
      summary:
        "حقق المنتخب الأردني فوزاً مهماً على نظيره الأسترالي في مباراة مثيرة بهدفين مقابل هدف ضمن تصفيات كأس آسيا.",
      body: "تمكن المنتخب الأردني لكرة القدم من تحقيق فوز ثمين على نظيره الأسترالي بنتيجة ٢-١ في المباراة التي أُقيمت على ملعب عمّان الدولي ضمن تصفيات كأس آسيا. سجّل هدفي المنتخب الأردني كل من موسى التعمري ويزن النعيمات، فيما قلّص المنتخب الأسترالي الفارق في الدقائق الأخيرة. ويعد هذا الفوز الأول للمنتخب الأردني على أستراليا منذ ٨ سنوات.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 96,
      category: "رياضة",
      location: "عمّان",
      authorId: id("user", 1),
      publishedAt: minutes(240),
      verificationStartedAt: minutes(244),
      verificationDurationSeconds: 60,
      aiExplanation: {
        verdict: "نتيجة موثقة من مصادر رياضية رسمية متعددة.",
        reasons: [
          { text: "بث مباشر من قنوات رياضية معتمدة", ok: true },
          { text: "تأكيد الاتحاد الأردني لكرة القدم", ok: true },
          { text: "تغطية موسعة من وكالات الأنباء", ok: true },
        ],
      },
      claims: [
        { text: "فوز المنتخب الأردني على أستراليا ٢-١", supported: true },
        { text: "هدفان للتعمري والنعيمات", supported: true },
      ],
      likes: 4820,
      comments: 612,
      shares: 1840,
    },
    {
      id: id("news", 11),
      title: "إطلاق نموذج ذكاء اصطناعي عربي مفتوح المصدر بقدرات منافسة عالمياً",
      summary:
        "أعلنت مجموعة من الباحثين العرب عن إطلاق نموذج لغوي ضخم يدعم اللهجات العربية بأداء يقترب من النماذج العالمية.",
      body: "أعلن فريق بحثي يضم خبراء من عدة دول عربية عن إطلاق نموذج ذكاء اصطناعي مفتوح المصدر متخصص في اللغة العربية ولهجاتها المختلفة. النموذج، الذي يحمل اسم 'جمل-٢'، يحتوي على ٧٠ مليار معامل وأظهر نتائج متميزة في اختبارات الفهم والإنتاج باللغة العربية الفصحى وعدد من اللهجات المحلية. وأكد الفريق أن النموذج متاح مجاناً للباحثين والمطورين، مع توفير الأوزان والشيفرة المصدرية كاملةً.",
      imageUrl: null,
      status: "verified",
      confidence: "medium",
      confidenceScore: 76,
      category: "تقنية",
      location: "دولي",
      authorId: id("user", 1),
      publishedAt: minutes(420),
      verificationStartedAt: minutes(425),
      verificationDurationSeconds: 120,
      aiExplanation: {
        verdict: "إطلاق موثق مع توفر النموذج للتحميل، لكن نتائج الأداء بحاجة لتحقق مستقل.",
        reasons: [
          { text: "النموذج متاح فعلاً على منصات مفتوحة المصدر", ok: true },
          { text: "الورقة البحثية منشورة وقابلة للمراجعة", ok: true },
          { text: "نتائج الأداء بحاجة لاختبار من جهات مستقلة", ok: false },
        ],
      },
      claims: [
        { text: "إطلاق نموذج عربي بـ٧٠ مليار معامل", supported: true },
        { text: "أداء يقترب من النماذج العالمية", supported: false },
      ],
      likes: 2140,
      comments: 318,
      shares: 924,
    },
    {
      id: id("news", 7),
      title: "بدء التسجيل في موسم الرياض 2026 وفعاليات جديدة كلياً",
      summary: "إعلان رسمي عن انطلاق موسم الرياض الجديد بفعاليات موسعة.",
      body: "أعلن المنظمون عن بدء التسجيل في موسم الرياض 2026 الذي سيشمل فعاليات جديدة كلياً وشراكات دولية لم يُعلن عنها سابقاً.",
      imageUrl: null,
      status: "verified",
      confidence: "high",
      confidenceScore: 90,
      category: "ترفيه",
      location: "الرياض",
      authorId: id("user", 2),
      publishedAt: minutes(720),
      verificationStartedAt: minutes(725),
      verificationDurationSeconds: 90,
      aiExplanation: {
        verdict: "إعلان موثق من الجهة المنظمة.",
        reasons: [
          { text: "إعلان رسمي من الجهة المنظمة", ok: true },
          { text: "تغطية متعددة المصادر", ok: true },
        ],
      },
      claims: [
        { text: "بدء التسجيل في موسم الرياض 2026", supported: true },
      ],
      likes: 1820,
      comments: 240,
      shares: 612,
    },
  ];
  await db.insert(newsTable).values(news);

  const ns: {
    id: string;
    newsId: string;
    sourceId: string | null;
    url: string;
  }[] = [];
  let nsCounter = 1;
  function link(
    newsId: string,
    items: Array<{ sourceId: string | null; url: string }>,
  ) {
    for (const it of items) {
      ns.push({
        id: id("ns", nsCounter++),
        newsId,
        sourceId: it.sourceId,
        url: it.url,
      });
    }
  }
  link(id("news", 1), [
    { sourceId: id("src", 6), url: "https://moh.gov.sa/news/jeddah-warehouse-2026-04-24" },
    { sourceId: id("src", 3), url: "https://spa.gov.sa/2026/jeddah-fire-incident" },
    { sourceId: id("src", 5), url: "https://ekhbariya.net/articles/jeddah-warehouse-fire" },
    { sourceId: id("src", 4), url: "https://okaz.com.sa/article/2114567/jeddah-fire" },
  ]);
  link(id("news", 2), [
    { sourceId: id("src", 4), url: "https://okaz.com.sa/article/2114890/heatwave-warning" },
    { sourceId: id("src", 2), url: "https://alarabiya.net/weather/2026/04/24/gulf-heatwave-forecast" },
  ]);
  link(id("news", 3), [
    { sourceId: id("src", 6), url: "https://moh.gov.sa/announcements/new-vaccine-clinical-trials" },
    { sourceId: id("src", 3), url: "https://spa.gov.sa/2026/health/vaccine-discovery" },
    { sourceId: id("src", 1), url: "https://reuters.com/health/saudi-vaccine-discovery-2026-04-24" },
    { sourceId: id("src", 7), url: "https://apnews.com/article/saudi-arabia-vaccine-trials-2026" },
  ]);
  link(id("news", 4), [
    { sourceId: id("src", 1), url: "https://reuters.com/markets/oil-prices-surge-2026-04-23" },
    { sourceId: id("src", 7), url: "https://apnews.com/article/oil-prices-global-markets" },
    { sourceId: id("src", 8), url: "https://bloomberg.com/news/articles/2026-04-23/oil-supply-update" },
  ]);
  link(id("news", 5), [
    { sourceId: id("src", 3), url: "https://spa.gov.sa/2026/sports/al-hilal-victory" },
    { sourceId: id("src", 4), url: "https://okaz.com.sa/article/2115012/al-hilal-match-report" },
    { sourceId: id("src", 5), url: "https://ekhbariya.net/sports/al-hilal-asia-final" },
  ]);
  link(id("news", 6), [
    { sourceId: id("src", 3), url: "https://spa.gov.sa/2026/clarification-statement" },
  ]);
  link(id("news", 7), [
    { sourceId: id("src", 3), url: "https://spa.gov.sa/2026/entertainment/riyadh-season-2026" },
    { sourceId: id("src", 5), url: "https://ekhbariya.net/entertainment/riyadh-season-launch" },
    { sourceId: id("src", 4), url: "https://okaz.com.sa/article/2115423/riyadh-season-2026" },
  ]);
  link(id("news", 8), [
    { sourceId: null, url: "https://www.moe.gov.jo/ar/news/2026/04/clarification-no-remote-learning" },
    { sourceId: id("src", 1), url: "https://reuters.com/world/middle-east/jordan-education-rumor-debunked-2026-04-24" },
    { sourceId: id("src", 2), url: "https://alarabiya.net/north-africa/jordan/2026/04/24/jordan-education-clarification" },
    { sourceId: id("src", 7), url: "https://apnews.com/article/jordan-education-ministry-statement-2026" },
  ]);
  await db.insert(newsSourcesTable).values(ns);

  const comments = [
    {
      id: id("c", 1),
      newsId: id("news", 1),
      authorId: id("user", 2),
      body: "تغطية ممتازة، شكراً للمصادر الواضحة.",
      createdAt: minutes(10),
    },
    {
      id: id("c", 2),
      newsId: id("news", 1),
      authorId: id("user", 4),
      body: "أتمنى السلامة للجميع، وشكراً للدفاع المدني.",
      createdAt: minutes(8),
    },
    {
      id: id("c", 3),
      newsId: id("news", 3),
      authorId: id("user", 1),
      body: "خبر مهم جداً، نأمل أن يكون اللقاح متاحاً قريباً.",
      createdAt: minutes(120),
    },
  ];
  await db.insert(commentsTable).values(comments);

  logger.info({ users: users.length, sources: sources.length, news: news.length }, "Seed complete");
}
