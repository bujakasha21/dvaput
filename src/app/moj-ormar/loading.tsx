import { ListingGridSkeleton } from "@/components/listing-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-8">
      <div className="flex items-center gap-4">
        <div className="skeleton size-14 rounded-full" />
        <div className="skeleton h-7 w-48 rounded" />
      </div>
      <div className="skeleton h-px w-full" />
      <ListingGridSkeleton count={5} />
    </div>
  );
}
