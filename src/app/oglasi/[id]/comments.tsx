"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment } from "@/app/actions/social";
import { Avatar } from "@/components/avatar";
import { Button, Textarea } from "@/components/ui";
import { TimeAgo } from "@/components/time-ago";

type Comment = { id: string; body: string; createdAt: string; author: { id: string; name: string; image: string | null } };

export function Comments({ listingId, sellerId, userId, comments }: { listingId: string; sellerId: string; userId?: string; comments: Comment[] }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await addComment(listingId, body);
      if (res.error) toast.error(res.error);
      else setBody("");
    });
  }

  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold tracking-tight">
        Pitanja i komentari <span className="text-muted">{comments.length}</span>
      </h2>

      <ul className="space-y-5">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.li key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="group flex gap-3">
              <Link href={`/korisnici/${c.author.id}`}>
                <Avatar name={c.author.name} image={c.author.image} size={32} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Link href={`/korisnici/${c.author.id}`} className="font-medium hover:underline">{c.author.name}</Link>
                  {c.author.id === sellerId && <span className="text-xs text-muted">· prodavač</span>}
                  <TimeAgo date={c.createdAt} className="text-xs text-muted" />
                  {userId && (userId === c.author.id || userId === sellerId) && (
                    <button
                      onClick={() => startTransition(() => deleteComment(c.id))}
                      className="ml-auto text-muted opacity-0 transition group-hover:opacity-100 hover:text-red-600"
                      aria-label="Obriši komentar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-sm whitespace-pre-line text-neutral-700">{c.body}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {comments.length === 0 && <li className="text-sm text-muted">Još nema pitanja.</li>}
      </ul>

      {userId ? (
        <form onSubmit={submit} className="mt-6 flex items-end gap-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Postavi pitanje o artiklu…" maxLength={500} className="min-h-11" rows={1} />
          <Button type="submit" loading={pending} disabled={body.trim().length < 2} className="shrink-0" aria-label="Pošalji komentar">
            {!pending && <Send className="size-4" />}
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">
          <Link href={`/prijava?next=/oglasi/${listingId}`} className="text-ink underline underline-offset-4">Prijavi se</Link> da ostaviš komentar.
        </p>
      )}
    </section>
  );
}
