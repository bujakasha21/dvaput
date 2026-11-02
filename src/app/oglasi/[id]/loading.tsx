export default function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
      <div className="skeleton aspect-[3/4] rounded-lg" />
      <div className="space-y-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-8 w-3/4 rounded" />
        <div className="skeleton h-7 w-24 rounded" />
        <div className="skeleton mt-8 h-40 w-full rounded" />
        <div className="skeleton h-12 w-full rounded-none" />
      </div>
    </div>
  );
}
