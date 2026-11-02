import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTrust, likedIdsFor, listingCardSelect } from "@/lib/queries";
import { CATEGORY_LABELS, CONDITION_HINTS, CONDITION_LABELS, GENDER_LABELS } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/utils";
import { categoryHref } from "@/lib/collections";
import { startConversation } from "@/app/actions/social";
import { ImageSlider } from "@/components/image-slider";
import { LikeButton } from "@/components/like-button";
import { Avatar } from "@/components/avatar";
import { Stars, TrustBadge } from "@/components/rating";
import { Badge, Button, SectionTitle, linkButton } from "@/components/ui";
import { ListingCard, ListingGrid } from "@/components/listing-card";
import { Comments } from "./comments";
import { OwnerActions } from "@/components/owner-actions";

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      seller: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true, image: true } } } },
      _count: { select: { likes: true } },
      conversations: { select: { buyer: { select: { id: true, name: true } } } },
    },
  });
}

export async function generateMetadata({ params }: PageProps<"/oglasi/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, select: { title: true, description: true } });
  return listing ? { title: listing.title, description: listing.description.slice(0, 150) } : {};
}

export default async function ListingPage({ params }: PageProps<"/oglasi/[id]">) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListing(id), getSession()]);
  if (!listing) notFound();

  const userId = session?.user.id;
  const isOwner = userId === listing.sellerId;
  if (!isOwner) await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });

  const [trust, sellerCount, liked, more] = await Promise.all([
    getTrust(listing.sellerId),
    prisma.listing.count({ where: { sellerId: listing.sellerId, status: "SOLD" } }),
    likedIdsFor(userId, [id]),
    prisma.listing.findMany({
      where: { sellerId: listing.sellerId, status: "ACTIVE", id: { not: id } },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: listingCardSelect,
    }),
  ]);

  const details = [
    { label: "Kategorija", value: CATEGORY_LABELS[listing.category] },
    { label: "Za", value: GENDER_LABELS[listing.gender] },
    { label: "Veličina", value: listing.size },
    { label: "Boja", value: listing.color },
    { label: "Materijal", value: listing.material },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
      <nav className="mb-6 flex gap-1.5 text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Početna</Link>
        <span>/</span>
        <Link href={categoryHref(listing.category)} className="hover:text-ink">{CATEGORY_LABELS[listing.category]}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div className="animate-fade-up">
          <ImageSlider images={listing.images.map((i) => i.url)} alt={listing.title} />
        </div>

        <div className="animate-fade-up lg:sticky lg:top-24 lg:self-start [animation-delay:60ms]">
          {listing.brand && <p className="text-[13px] tracking-wide text-muted uppercase">{listing.brand}</p>}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{listing.title}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-medium">{formatPrice(listing.price)}</p>
            {listing.negotiable && <span className="text-[13px] text-muted">po dogovoru</span>}
            {listing.status !== "ACTIVE" && <Badge className="ml-auto">{listing.status === "SOLD" ? "Prodano" : "Rezervisano"}</Badge>}
          </div>

          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            {[...details, { label: "Stanje", value: CONDITION_LABELS[listing.condition] }, { label: "Lokacija", value: listing.city }, { label: "Dostava", value: listing.shipping ? "Moguća" : "Samo lično preuzimanje" }]
              .filter((d) => d.value)
              .map((d) => (
                <div key={d.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{d.label}</dt>
                  <dd className="text-right">{d.value}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-2 text-xs text-muted">{CONDITION_HINTS[listing.condition]}</p>

          <div className="mt-8">
            {isOwner ? (
              <div className="flex flex-wrap gap-2">
                <Link href={`/oglasi/${id}/uredi`} className={linkButton.outline}>Uredi</Link>
                <OwnerActions listingId={id} status={listing.status} buyers={uniqueBuyers(listing.conversations)} />
              </div>
            ) : (
              <div className="flex gap-2">
                {listing.status !== "SOLD" && (
                  <form action={startConversation.bind(null, id)} className="flex-1">
                    <Button type="submit" size="lg" className="w-full">Pošalji poruku</Button>
                  </form>
                )}
                <LikeButton listingId={id} liked={liked.has(id)} count={listing._count.likes} variant="pill" />
              </div>
            )}
          </div>

          <p className="mt-8 text-sm leading-relaxed whitespace-pre-line text-neutral-700">{listing.description}</p>
          <p className="mt-4 text-xs text-muted">
            Objavljeno {timeAgo(listing.createdAt)} · {listing.views} pregleda
          </p>

          <Link href={`/korisnici/${listing.seller.id}`} className="group mt-8 flex items-center gap-3 border-t border-line pt-6">
            <Avatar name={listing.seller.name} image={listing.seller.image} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium group-hover:underline">{listing.seller.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                {trust.count ? (
                  <>
                    <Stars value={trust.average} size={11} /> {trust.average} ({trust.count})
                  </>
                ) : (
                  "Bez dojmova"
                )}
                <span>· {sellerCount} prodano</span>
              </p>
            </div>
            <TrustBadge trust={trust} />
          </Link>
        </div>
      </div>

      <div className="mt-20 max-w-2xl">
        <Comments
          listingId={id}
          sellerId={listing.sellerId}
          userId={userId}
          comments={listing.comments.map((c) => ({ id: c.id, body: c.body, createdAt: c.createdAt.toISOString(), author: c.author }))}
        />
      </div>

      {more.length > 0 && (
        <section className="mt-20">
          <SectionTitle aside={<Link href={`/korisnici/${listing.seller.id}`} className="text-[13px] text-muted hover:text-ink">Svi artikli →</Link>}>
            Još od {listing.seller.name.split(" ")[0]}
          </SectionTitle>
          <ListingGrid>
            {more.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} showLike={false} />
            ))}
          </ListingGrid>
        </section>
      )}
    </div>
  );
}

function uniqueBuyers(conversations: { buyer: { id: string; name: string } }[]) {
  return [...new Map(conversations.map((c) => [c.buyer.id, c.buyer])).values()];
}
