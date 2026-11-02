import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export const listingCardSelect = {
  id: true,
  title: true,
  price: true,
  size: true,
  brand: true,
  condition: true,
  status: true,
  city: true,
  createdAt: true,
  images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
  seller: { select: { id: true, name: true, image: true } },
  _count: { select: { likes: true } },
} satisfies Prisma.ListingSelect;

export type ListingCardData = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

export async function likedIdsFor(userId: string | undefined, listingIds: string[]) {
  if (!userId || listingIds.length === 0) return new Set<string>();
  const likes = await prisma.like.findMany({
    where: { userId, listingId: { in: listingIds } },
    select: { listingId: true },
  });
  return new Set(likes.map((l) => l.listingId));
}

export type Trust = {
  average: number;
  count: number;
  level: "new" | "ok" | "good" | "top";
  label: string;
};

export async function getTrust(userId: string): Promise<Trust> {
  const agg = await prisma.review.aggregate({
    where: { targetId: userId },
    _avg: { rating: true },
    _count: true,
  });
  const average = Math.round((agg._avg.rating ?? 0) * 10) / 10;
  const count = agg._count;
  return { average, count, ...trustLevel(average, count) };
}

export function trustLevel(average: number, count: number): Pick<Trust, "level" | "label"> {
  if (count === 0) return { level: "new", label: "Novi korisnik" };
  if (average >= 4.7 && count >= 5) return { level: "top", label: "Super pouzdan" };
  if (average >= 4) return { level: "good", label: "Pouzdan" };
  return { level: "ok", label: "Oprez" };
}

export async function unreadCount(userId: string) {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}
