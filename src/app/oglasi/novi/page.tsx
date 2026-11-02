import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = { title: "Novi oglas" };

export default async function NewListingPage() {
  const session = await getSession();
  if (!session) redirect("/prijava?next=/oglasi/novi");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="animate-fade-up text-4xl font-semibold tracking-tight sm:text-5xl">Prodaj artikal</h1>
      <p className="mt-3 mb-12 text-base text-muted sm:mb-16">Šest kratkih koraka i tvoj artikal je online. Pregled vidiš uživo sa strane.</p>
      <ListingForm defaultCity={(session.user as { city?: string | null }).city} />
    </div>
  );
}
