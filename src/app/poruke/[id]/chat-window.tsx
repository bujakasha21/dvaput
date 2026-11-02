"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { sendMessage } from "@/app/actions/social";
import { Avatar } from "@/components/avatar";
import { ReviewForm } from "@/components/review-form";
import { cn, formatPrice } from "@/lib/utils";

type Msg = { id: string; body: string; createdAt: string; senderId: string; readAt: string | null; pending?: boolean };

type Props = {
  conversationId: string;
  userId: string;
  other: { id: string; name: string; image: string | null };
  listing: { id: string; title: string; price: number; status: string; image?: string };
  isSeller: boolean;
  canReview: boolean;
  initial: Msg[];
};

const QUICK = ["Da li je još dostupno?", "Može li malo niža cijena?", "Šaljete li poštom?", "Gdje se može preuzeti?"];
const POLL_MS = 3000;

export function ChatWindow({ conversationId, userId, other, listing, isSeller, canReview, initial }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const lastAt = useRef(initial.at(-1)?.createdAt);

  const poll = useCallback(async () => {
    const qs = lastAt.current ? `?after=${encodeURIComponent(lastAt.current)}` : "";
    const res = await fetch(`/api/conversations/${conversationId}/messages${qs}`, { cache: "no-store" });
    if (!res.ok) return;
    const { messages: fresh } = (await res.json()) as { messages: Msg[] };
    if (!fresh.length) return;
    lastAt.current = fresh.at(-1)!.createdAt;
    setMessages((prev) => {
      const confirmed = prev.filter((m) => !m.pending);
      const ids = new Set(confirmed.map((m) => m.id));
      return [...confirmed, ...fresh.filter((m) => !ids.has(m.id))];
    });
    if (fresh.some((m) => m.senderId !== userId)) router.refresh();
  }, [conversationId, userId, router]);

  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && poll(), POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(body: string) {
    const value = body.trim();
    if (!value) return;
    setText("");
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, body: value, createdAt: new Date().toISOString(), senderId: userId, readAt: null, pending: true }]);
    const res = await sendMessage(conversationId, value);
    if (res.error) {
      toast.error(res.error);
      setMessages((prev) => prev.filter((m) => !m.pending));
      return;
    }
    await poll();
    router.refresh();
  }

  return (
    <section className="flex min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link href="/poruke" className="grid size-9 place-items-center rounded-full hover:bg-bg md:hidden" aria-label="Nazad">
          <ArrowLeft className="size-5" />
        </Link>
        <Link href={`/korisnici/${other.id}`} className="flex min-w-0 items-center gap-2">
          <Avatar name={other.name} image={other.image} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{other.name}</p>
            <p className="text-xs text-muted">{isSeller ? "Kupac" : "Prodavač"}</p>
          </div>
        </Link>
        <div className="ml-auto">{canReview && <ReviewForm targetId={other.id} targetName={other.name} listingId={listing.id} />}</div>
      </header>

      <Link href={`/oglasi/${listing.id}`} className="flex items-center gap-3 border-b border-line px-4 py-2.5 transition-colors hover:bg-subtle">
        <img src={listing.image} alt="" className="size-10 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{listing.title}</p>
          <p className="text-xs font-bold">{formatPrice(listing.price)}</p>
        </div>
        {listing.status !== "ACTIVE" && (
          <span className="rounded-none border border-line px-2.5 py-0.5 text-[11px]">{listing.status === "SOLD" ? "Prodano" : "Rezervisano"}</span>
        )}
      </Link>

      <div ref={list} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="mx-auto max-w-sm py-10 text-center">
            <p className="font-medium">Započni razgovor</p>
            <p className="text-sm text-muted">Pitaj nešto ili izaberi brzu poruku ispod.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.senderId === userId;
          const grouped = messages[i - 1]?.senderId === m.senderId;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18 }} className={cn("flex", mine ? "justify-end" : "justify-start", !grouped && "pt-2")}>
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line",
                  mine ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-subtle text-ink",
                  m.pending && "opacity-60",
                )}
              >
                {m.body}
                <span suppressHydrationWarning className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10px]", mine ? "text-white/50" : "text-muted")}>
                  {new Date(m.createdAt).toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })}
                  {mine && <CheckCheck className={cn("size-3", m.readAt ? "text-white" : "text-white/40")} />}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isSeller && messages.length < 2 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)} className="shrink-0 rounded-none border border-line px-3 py-1.5 text-xs transition-colors hover:border-ink">
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex items-end gap-2 border-t border-line p-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Napiši poruku…"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-none bg-subtle px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ink"
        />
        <button type="submit" disabled={!text.trim()} className="grid size-10 shrink-0 place-items-center rounded-none bg-ink text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-30" aria-label="Pošalji">
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}
