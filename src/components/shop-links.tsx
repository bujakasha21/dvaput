"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURED_SLUGS, collectionHref, getCollection } from "@/lib/collections";
import { cn } from "@/lib/utils";

const SLUGS = [...FEATURED_SLUGS, "torbe"];

/** Brze kategorije pored logotipa; na mobitelu kao skrolajući red ispod navbara */
export function ShopLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={className}>
      {SLUGS.map((slug) => {
        const href = collectionHref(slug);
        const active = pathname === href;
        return (
          <Link key={slug} href={href} className={cn("shrink-0 text-sm whitespace-nowrap transition-colors", active ? "font-medium text-ink" : "text-neutral-500 hover:text-ink")}>
            {getCollection(slug)!.title}
          </Link>
        );
      })}
    </div>
  );
}
