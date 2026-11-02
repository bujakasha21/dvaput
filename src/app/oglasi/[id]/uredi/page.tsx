import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = { title: "Uredi oglas" };

export default async function EditListingPage({ params }: PageProps<"/oglasi/[id]/uredi">) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/prijava?next=/oglasi/${id}/uredi`);

  const listing = await prisma.listing.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } });
  if (!listing || listing.sellerId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="animate-fade-up text-4xl font-semibold tracking-tight sm:text-5xl">Uredi oglas</h1>
      <p className="mt-3 mb-12 text-base text-muted sm:mb-16">{listing.title}</p>
      <ListingForm listing={listing} />
    </div>
  );
}
