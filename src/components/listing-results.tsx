import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { Category, Condition, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { likedIdsFor, listingCardSelect } from "@/lib/queries";
import { ListingCard, ListingGrid } from "./listing-card";
import { EmptyState } from "./ui";

export type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
  return typeof v === "string" && v ? v : undefined;
}

/** Lista artikala po URL filterima (?q, category, gender, condition, min, max, sort) unutar zadane kategorije */
export async function ListingResults({ params, base, userId }: { params: SearchParams; base: Prisma.ListingWhereInput; userId?: string }) {
  const q = str(params.q);
  const category = str(params.category);
  const gender = str(params.gender);
  const condition = str(params.condition);
  const min = Number(str(params.min)) || undefined;
  const max = Number(str(params.max)) || undefined;
  const sort = str(params.sort);

  const where: Prisma.ListingWhereInput = {
    status: { in: ["ACTIVE", "RESERVED"] },
    ...(category && category in Category && { category: category as Category }),
    ...(gender && gender in Gender && { gender: gender as Gender }),
    ...(condition && condition in Condition && { condition: condition as Condition }),
    ...((min || max) && { price: { gte: min, lte: max } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { size: { equals: q, mode: "insensitive" } },
      ],
    }),
    ...base,
  };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : sort === "popular" ? { likes: { _count: "desc" } } : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({ where, orderBy, take: 60, select: listingCardSelect });
  const liked = await likedIdsFor(userId, listings.map((l) => l.id));

  if (listings.length === 0) {
    return <EmptyState icon={<Search />} title="Nema rezultata" text="Trenutno nema artikala za ove filtere." />;
  }

  return (
    <>
      <p className="-mt-2 mb-6 text-[13px] text-muted">{listings.length} artikala</p>
      <ListingGrid>
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} liked={liked.has(listing.id)} index={i} showLike={listing.seller.id !== userId} />
        ))}
      </ListingGrid>
    </>
  );
}
