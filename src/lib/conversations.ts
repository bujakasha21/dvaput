import "server-only";
import { prisma } from "./prisma";

export async function getConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }], messages: { some: {} } },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, price: true, status: true, images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } } },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { readAt: null, senderId: { not: userId } } } } },
    },
  });
  return conversations.map((c) => ({
    id: c.id,
    listing: c.listing,
    other: c.buyerId === userId ? c.seller : c.buyer,
    role: c.buyerId === userId ? ("buyer" as const) : ("seller" as const),
    last: c.messages[0] ?? null,
    unread: c._count.messages,
    updatedAt: c.updatedAt,
  }));
}

export type ConversationPreview = Awaited<ReturnType<typeof getConversations>>[number];

/** Vraća razgovor samo ako je korisnik učesnik */
export async function getConversationFor(conversationId: string, userId: string) {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { select: { id: true, title: true, price: true, status: true, sellerId: true, buyerId: true, images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } } },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
    },
  });
  if (!c || (c.buyerId !== userId && c.sellerId !== userId)) return null;
  return c;
}

export async function markRead(conversationId: string, userId: string) {
  await prisma.message.updateMany({ where: { conversationId, senderId: { not: userId }, readAt: null }, data: { readAt: new Date() } });
}
