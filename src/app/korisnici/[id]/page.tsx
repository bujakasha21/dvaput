import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shirt, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTrust, likedIdsFor, listingCardSelect } from "@/lib/queries";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { ListingCard, ListingGrid } from "@/components/listing-card";
import { Stars, TrustBadge, TrustMeter } from "@/components/rating";
import { ReviewList } from "@/components/review-list";
import { EmptyState, SectionTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/korisnici/[id]">): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: user?.name ?? "Profil" };
}

export default async function UserPage({ params }: PageProps<"/korisnici/[id]">) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, image: true, bio: true, city: true, createdAt: true } });
  if (!user) notFound();

  const session = await getSession();
  const [trust, listings, sold, reviews, breakdown] = await Promise.all([
    getTrust(id),
    prisma.listing.findMany({ where: { sellerId: id, status: { not: "SOLD" } }, orderBy: { createdAt: "desc" }, select: listingCardSelect }),
    prisma.listing.count({ where: { sellerId: id, status: "SOLD" } }),
    prisma.review.findMany({
      where: { targetId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { id: true, name: true, image: true } }, listing: { select: { id: true, title: true } } },
    }),
    prisma.review.groupBy({ by: ["rating"], where: { targetId: id }, _count: true }),
  ]);
  const liked = await likedIdsFor(session?.user.id, listings.map((l) => l.id));
  const byRating = Object.fromEntries(breakdown.map((b) => [b.rating, b._count]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="animate-fade-up grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="flex items-start gap-5">
          <Avatar name={user.name} image={user.image} size={72} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{user.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
              <TrustBadge trust={trust} />
              {user.city && <span>{user.city}</span>}
              <span>· član {timeAgo(user.createdAt)}</span>
              <span>· {sold} prodano</span>
            </p>
            {user.bio && <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-700">{user.bio}</p>}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">{trust.count ? trust.average.toFixed(1) : "—"}</span>
            <div className="pb-1">
              <Stars value={trust.average} size={12} />
              <p className="text-xs text-muted">{trust.count} dojmova</p>
            </div>
          </div>
          <TrustMeter trust={trust} />
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r} className="flex items-center gap-2 text-[11px] text-muted tabular-nums">
                <span className="w-2">{r}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${trust.count ? ((byRating[r] ?? 0) / trust.count) * 100 : 0}%` }} />
                </div>
                <span className="w-4 text-right">{byRating[r] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <SectionTitle>Artikli <span className="text-muted">{listings.length}</span></SectionTitle>
        {listings.length ? (
          <ListingGrid>
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} liked={liked.has(l.id)} index={i} showLike={session?.user.id !== id} />
            ))}
          </ListingGrid>
        ) : (
          <EmptyState icon={<Shirt />} title="Nema aktivnih artikala" text="Ovaj korisnik trenutno nema ništa na prodaju." />
        )}
      </section>

      <section className="mt-16">
        <SectionTitle>Dojmovi</SectionTitle>
        {reviews.length ? <ReviewList reviews={reviews} /> : <EmptyState icon={<Star />} title="Još nema dojmova" text="Dojmovi se pojavljuju nakon kupovine ili prodaje." />}
      </section>
    </div>
  );
}
