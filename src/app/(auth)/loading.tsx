/** Skeleton forme dok se učitava prijava/registracija */
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy aria-label="Učitavanje">
      <div className="skeleton h-7 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton mt-8 h-11 w-full" />
      <div className="skeleton mx-auto my-6 h-3 w-10" />
      {[0, 1].map((i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-3.5 w-16" />
          <div className="skeleton h-11 w-full" />
        </div>
      ))}
      <div className="skeleton h-12 w-full" />
    </div>
  );
}
