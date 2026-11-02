import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConversationFor, markRead } from "@/lib/conversations";

// Polling endpoint za chat: vraća poruke novije od ?after=<ISO datum>
export async function GET(req: Request, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await getConversationFor(id, session.user.id))) return NextResponse.json({ error: "not found" }, { status: 404 });

  const after = new URL(req.url).searchParams.get("after");
  const messages = await prisma.message.findMany({
    where: { conversationId: id, ...(after && { createdAt: { gt: new Date(after) } }) },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, body: true, createdAt: true, senderId: true, readAt: true },
  });
  if (messages.some((m) => m.senderId !== session.user.id && !m.readAt)) await markRead(id, session.user.id);

  return NextResponse.json({ messages });
}
