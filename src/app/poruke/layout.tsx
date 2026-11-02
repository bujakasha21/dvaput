import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { ConversationList } from "./conversation-list";

export default async function MessagesLayout({ children }: LayoutProps<"/poruke">) {
  const session = await getSession();
  if (!session) redirect("/prijava?next=/poruke");
  const conversations = await getConversations(session.user.id);

  return (
    <div className="mx-auto max-w-7xl px-0 sm:px-6 sm:py-8">
      <div className="grid h-[calc(100dvh-3.5rem)] overflow-hidden border-line bg-surface sm:h-[calc(100dvh-8rem)] sm:rounded-xl sm:border md:grid-cols-[340px_1fr]">
        <ConversationList
          conversations={conversations.map((c) => ({ ...c, updatedAt: c.updatedAt.toISOString(), last: c.last && { body: c.last.body, senderId: c.last.senderId, createdAt: c.last.createdAt.toISOString() } }))}
          userId={session.user.id}
        />
        {children}
      </div>
    </div>
  );
}
