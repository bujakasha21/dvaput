import { ListingGridSkeleton } from "@/components/listing-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-8">
      <div className="skeleton h-8 w-1/3 rounded" />
      <ListingGridSkeleton />
    </div>
  );
}
