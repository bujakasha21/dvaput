import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { collectionHref, collectionWhere, getCollection } from "@/lib/collections";
import { Filters } from "@/components/filters";
import { ListingGridSkeleton } from "@/components/listing-card";
import { ListingResults } from "@/components/listing-results";

export async function generateMetadata({ params }: PageProps<"/kategorije/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  return c ? { title: c.title, description: c.description } : {};
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/kategorije/[slug]">) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const [query, session] = await Promise.all([searchParams, getSession()]);
  const q = typeof query.q === "string" ? query.q : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <nav className="flex gap-1.5 text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Početna</Link>
        <span>/</span>
        <Link href={collectionHref("sve")} className="hover:text-ink">Kategorije</Link>
      </nav>

      <header className="animate-fade-up mt-6 mb-10">
        <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{q ? `„${q}”` : collection.title}</h1>
        <p className="mt-3 max-w-lg text-[15px] text-muted">{q ? `Rezultati pretrage u kategoriji ${collection.title.toLowerCase()}.` : collection.description}</p>
      </header>

      <div className="space-y-8">
        <Filters hideCategories={Boolean(collection.category)} hideGender={Boolean(collection.gender)} />
        <Suspense key={JSON.stringify(query)} fallback={<ListingGridSkeleton />}>
          <ListingResults params={query} base={collectionWhere(collection)} userId={session?.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
