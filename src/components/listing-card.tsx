import Link from "next/link";
import type { ListingCardData } from "@/lib/queries";
import { cn, formatPrice } from "@/lib/utils";
import { LikeButton } from "./like-button";

export function ListingCard({ listing, liked, index = 0, showLike = true }: { listing: ListingCardData; liked?: boolean; index?: number; showLike?: boolean }) {
  const image = listing.images[0]?.url;
  const sold = listing.status === "SOLD";
  const meta = [listing.size, listing.brand].filter(Boolean).join(" · ");

  return (
    <Link href={`/oglasi/${listing.id}`} className="group animate-fade-up block" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-subtle">
        {image && (
          <img src={image} alt={listing.title} loading="lazy" className={cn("size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]", sold && "opacity-50")} />
        )}
        {showLike && (
          <div className="absolute top-2 right-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 has-[[data-liked=true]]:opacity-100">
            <LikeButton listingId={listing.id} liked={Boolean(liked)} />
          </div>
        )}
        {listing.status !== "ACTIVE" && (
          <span className="absolute bottom-2 left-2 rounded-none bg-white px-2.5 py-1 text-[11px] font-medium">{sold ? "Prodano" : "Rezervisano"}</span>
        )}
      </div>
      <div className="mt-2.5 space-y-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[13px] text-muted">{meta || " "}</p>
          <p className="shrink-0 text-sm font-medium">{formatPrice(listing.price)}</p>
        </div>
        <p className="truncate text-sm">{listing.title}</p>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[3/4] rounded-lg" />
      <div className="mt-2.5 space-y-1.5">
        <div className="skeleton h-3.5 w-1/2 rounded" />
        <div className="skeleton h-3.5 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function ListingGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}

export function ListingGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ListingGrid>
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </ListingGrid>
  );
}
