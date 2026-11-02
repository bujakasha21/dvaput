"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      className="group relative w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const next = new URLSearchParams(params);
        if (q.trim()) next.set("q", q.trim());
        else next.delete("q");
        // Na stranici kategorije traži unutar nje, inače u svim artiklima
        const base = pathname.startsWith("/kategorije/") ? pathname : "/kategorije/sve";
        router.push(`${base}?${next.toString()}`);
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pretraži"
        className="h-9 w-full rounded-none bg-subtle pr-4 pl-9 text-sm outline-none transition-colors placeholder:text-muted focus:bg-white focus:ring-1 focus:ring-ink"
      />
    </form>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={<div className="h-9 w-full max-w-sm rounded-none bg-subtle" />}>
      <SearchInput />
    </Suspense>
  );
}
