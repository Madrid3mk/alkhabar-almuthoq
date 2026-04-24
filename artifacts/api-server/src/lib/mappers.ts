import type { News, Source, User, Comment } from "@workspace/db";

type Confidence = "high" | "medium" | "low";

function asConfidence(v: string): Confidence {
  if (v === "high" || v === "medium" || v === "low") return v;
  return "medium";
}

type NewsStatus = "verifying" | "verified" | "unverified" | "rejected";
function asStatus(v: string): NewsStatus {
  if (v === "verifying" || v === "verified" || v === "unverified" || v === "rejected") return v;
  return "verifying";
}

type Tier = "regular" | "trusted" | "verified_publisher";
function asTier(v: string): Tier {
  if (v === "regular" || v === "trusted" || v === "verified_publisher") return v;
  return "regular";
}

type SrcType = "news_agency" | "newspaper" | "tv_channel" | "website" | "official";
function asSourceType(v: string): SrcType {
  if (v === "news_agency" || v === "newspaper" || v === "tv_channel" || v === "website" || v === "official") return v;
  return "website";
}

export function authorMini(u: User) {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    avatarUrl: u.avatarUrl ?? undefined,
    tier: asTier(u.tier),
    accuracyScore: u.accuracyScore,
  };
}

export function sourceMini(s: Source) {
  return {
    id: s.id,
    name: s.name,
    url: s.url,
    score: s.score,
    type: asSourceType(s.type),
    verified: s.verified,
  };
}

export function sourceFull(s: Source) {
  return {
    ...sourceMini(s),
    articlesCount: s.articlesCount,
    accuracyHistory: s.accuracyHistory ?? [],
  };
}

export function newsCard(n: News, author: User, sourcesCount: number) {
  return {
    id: n.id,
    title: n.title,
    summary: n.summary,
    imageUrl: n.imageUrl ?? undefined,
    status: asStatus(n.status),
    confidence: asConfidence(n.confidence),
    confidenceScore: n.confidenceScore,
    category: n.category,
    location: n.location ?? undefined,
    publishedAt: n.publishedAt.toISOString(),
    author: authorMini(author),
    sourcesCount,
    stats: {
      likes: n.likes,
      comments: n.comments,
      shares: n.shares,
    },
  };
}

export function newsDetail(
  n: News,
  author: User,
  sources: Source[],
) {
  return {
    ...newsCard(n, author, sources.length),
    body: n.body,
    sources: sources.map(sourceMini),
    aiExplanation: n.aiExplanation,
    claims: n.claims ?? [],
  };
}

export function userProfile(u: User) {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    avatarUrl: u.avatarUrl ?? undefined,
    bio: u.bio ?? undefined,
    tier: asTier(u.tier),
    accuracyScore: u.accuracyScore,
    consistencyScore: u.consistencyScore,
    publishedCount: u.publishedCount,
    correctCount: u.correctCount,
    followers: u.followers,
    following: u.following,
    progressToNextTier: u.progressToNextTier,
  };
}

export function commentDto(c: Comment, author: User) {
  return {
    id: c.id,
    author: authorMini(author),
    body: c.body,
    createdAt: c.createdAt.toISOString(),
  };
}

export function computeVerification(n: News) {
  const totalSec = n.verificationDurationSeconds;
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - n.verificationStartedAt.getTime()) / 1000),
  );
  const progress = Math.min(100, Math.round((elapsed / totalSec) * 100));
  const etaSeconds = Math.max(0, totalSec - elapsed);

  const stageDefs = [
    { key: "linguistic", label: "تحليل محتوى الخبر", ratio: 0.25 },
    { key: "sources", label: "فحص المصادر", ratio: 0.5 },
    { key: "matching", label: "مطابقة المعلومات", ratio: 0.8 },
    { key: "trust", label: "تقييم الموثوقية", ratio: 1.0 },
  ];

  const stages = stageDefs.map((s) => {
    const threshold = s.ratio * 100;
    let status: "pending" | "running" | "passed" | "failed" = "pending";
    if (n.status === "rejected" && progress >= threshold) {
      status = "failed";
    } else if (progress >= threshold) {
      status = "passed";
    } else if (progress >= threshold - 25) {
      status = "running";
    }
    return { key: s.key, label: s.label, status };
  });

  return {
    newsId: n.id,
    progress,
    etaSeconds,
    stages,
    finalConfidence: progress >= 100 ? asConfidence(n.confidence) : undefined,
    finalScore: progress >= 100 ? n.confidenceScore : undefined,
  };
}
