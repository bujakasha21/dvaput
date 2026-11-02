import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "./avatar";
import { Stars } from "./rating";

type Review = { id: string; rating: number; body: string | null; createdAt: Date; author: { id: string; name: string; image: string | null }; listing: { id: string; title: string } | null };

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="grid gap-x-12 md:grid-cols-2">
      {reviews.map((r, i) => (
        <li key={r.id} className="animate-fade-up border-b border-line py-5" style={{ animationDelay: `${i * 30}ms` }}>
          <div className="flex items-center gap-3">
            <Avatar name={r.author.name} image={r.author.image} size={28} />
            <Link href={`/korisnici/${r.author.id}`} className="text-sm font-medium hover:underline">{r.author.name}</Link>
            <span className="text-xs text-muted">{timeAgo(r.createdAt)}</span>
            <span className="ml-auto"><Stars value={r.rating} size={12} /></span>
          </div>
          {r.body && <p className="mt-3 text-sm text-neutral-700">{r.body}</p>}
          {r.listing && (
            <Link href={`/oglasi/${r.listing.id}`} className="mt-2 inline-block text-xs text-muted hover:text-ink">
              {r.listing.title}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
