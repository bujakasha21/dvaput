"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { TimeAgo } from "@/components/time-ago";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  listing: { id: string; title: string; images: { url: string }[] };
  other: { id: string; name: string; image: string | null };
  role: "buyer" | "seller";
  last: { body: string; senderId: string; createdAt: string } | null;
  unread: number;
  updatedAt: string;
};

export function ConversationList({ conversations, userId }: { conversations: Item[]; userId: string }) {
  const pathname = usePathname();
  const inChat = pathname !== "/poruke";

  return (
    <aside className={cn("flex min-h-0 flex-col border-r border-line", inChat && "hidden md:flex")}>
      <div className="border-b border-line px-5 py-4">
        <h1 className="text-base font-semibold">Poruke</h1>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.length === 0 && <li className="p-6 text-center text-sm text-muted">Još nema razgovora.</li>}
        {conversations.map((c) => {
          const active = pathname === `/poruke/${c.id}`;
          return (
            <li key={c.id}>
              <Link href={`/poruke/${c.id}`} className={cn("flex items-center gap-3 rounded-lg p-3 transition", active ? "bg-subtle" : "hover:bg-subtle/60")}>
                <div className="relative shrink-0">
                  <img src={c.listing.images[0]?.url} alt="" className="h-12 w-10 rounded-md bg-subtle object-cover" />
                  <span className="absolute -right-1 -bottom-1 rounded-full ring-2 ring-surface">
                    <Avatar name={c.other.name} image={c.other.image} size={22} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{c.other.name}</p>
                    <TimeAgo date={c.last?.createdAt ?? c.updatedAt} className="ml-auto shrink-0 text-[11px] text-muted" />
                  </div>
                  <p className="truncate text-xs text-muted">{c.listing.title}</p>
                  <p className={cn("truncate text-xs", c.unread ? "font-semibold text-ink" : "text-muted")}>
                    {c.last?.senderId === userId && "Ti: "}
                    {c.last?.body}
                  </p>
                </div>
                {c.unread > 0 && <span className="size-2 shrink-0 rounded-full bg-like" aria-label={`${c.unread} nepročitanih`} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
