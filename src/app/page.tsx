import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { likedIdsFor, listingCardSelect } from "@/lib/queries";
import { FEATURED_SLUGS, collectionHref, collectionWhere, getCollection } from "@/lib/collections";
import { ListingCard, ListingCardSkeleton } from "@/components/listing-card";
import { HomeBanner } from "@/components/home-banner";

const ROW_SIZE = 4;

export default async function HomePage() {
  const session = await getSession();
  const userId = session?.user.id;
  const rows = [
    { slug: "sve", title: "Novo u ponudi", where: {} },
    ...FEATURED_SLUGS.map((slug) => {
      const c = getCollection(slug)!;
      return { slug, title: c.title, where: collectionWhere(c) };
    }),
  ];

  return (
    <>
      <section className="animate-fade-up mx-auto max-w-7xl px-4 pt-4 pb-6 sm:px-8 sm:pt-6">
        <HomeBanner />
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-10 sm:space-y-20 sm:px-8">
        {rows.map((row) => (
          <Suspense key={row.slug} fallback={<RowSkeleton title={row.title} />}>
            <CollectionRow {...row} userId={userId} />
          </Suspense>
        ))}
      </div>
    </>
  );
}

async function CollectionRow({ slug, title, where, userId }: { slug: string; title: string; where: Prisma.ListingWhereInput; userId?: string }) {
  const listings = await prisma.listing.findMany({
    where: { status: { in: ["ACTIVE", "RESERVED"] }, ...where },
    orderBy: { createdAt: "desc" },
    take: ROW_SIZE,
    select: listingCardSelect,
  });
  if (listings.length === 0) return null;
  const liked = await likedIdsFor(userId, listings.map((l) => l.id));

  return (
    <section>
      <RowHeader title={title} href={collectionHref(slug)} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} liked={liked.has(listing.id)} index={i} showLike={listing.seller.id !== userId} />
        ))}
      </div>
    </section>
  );
}

function RowHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="group flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink">
          Vidi sve <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function RowSkeleton({ title }: { title: string }) {
  return (
    <section>
      <RowHeader title={title} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
        {Array.from({ length: ROW_SIZE }, (_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
