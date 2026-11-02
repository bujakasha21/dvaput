import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConversationFor, markRead } from "@/lib/conversations";
import { ChatWindow } from "./chat-window";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage({ params }: PageProps<"/poruke/[id]">) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/prijava");
  const userId = session.user.id;

  const conversation = await getConversationFor(id, userId);
  if (!conversation) notFound();

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, createdAt: true, senderId: true, readAt: true },
  });
  await markRead(id, userId);

  const other = conversation.buyerId === userId ? conversation.seller : conversation.buyer;
  const reviewed = await prisma.review.findFirst({ where: { authorId: userId, targetId: other.id, listingId: conversation.listingId }, select: { id: true } });

  return (
    <ChatWindow
      key={id}
      conversationId={id}
      userId={userId}
      other={other}
      listing={{ ...conversation.listing, image: conversation.listing.images[0]?.url }}
      isSeller={conversation.sellerId === userId}
      canReview={!reviewed && messages.length > 0}
      initial={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), readAt: m.readAt?.toISOString() ?? null }))}
    />
  );
}
