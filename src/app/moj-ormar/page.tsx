import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Heart, Package, Shirt, Star } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTrust, listingCardSelect } from "@/lib/queries";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { ListingCard, ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { OwnerActions } from "@/components/owner-actions";
import { Stars, TrustBadge, TrustMeter } from "@/components/rating";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { EmptyState, linkButton } from "@/components/ui";
import { DashboardTabs } from "./tabs";

export const metadata: Metadata = { title: "Moj ormar" };

const TABS = ["aktivni", "zavrseno", "sacuvano", "dojmovi"] as const;
type Tab = (typeof TABS)[number];

export default async function DashboardPage({ searchParams }: PageProps<"/moj-ormar">) {
  const session = await getSession();
  if (!session) redirect("/prijava?next=/moj-ormar");
  const user = session.user;
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "aktivni";

  const [trust, counts, totals] = await Promise.all([
    getTrust(user.id),
    Promise.all([
      prisma.listing.count({ where: { sellerId: user.id, status: { not: "SOLD" } } }),
      prisma.listing.count({ where: { OR: [{ sellerId: user.id, status: "SOLD" }, { buyerId: user.id }] } }),
      prisma.like.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { targetId: user.id } }),
    ]),
    prisma.listing.aggregate({ where: { sellerId: user.id, status: "SOLD" }, _sum: { price: true }, _count: true }),
  ]);

  const stats = [
    { label: "Zarađeno", value: formatPrice(totals._sum.price ?? 0) },
    { label: "Prodano", value: String(totals._count) },
    { label: "Ocjena", value: trust.count ? `${trust.average} / 5` : "—" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="animate-fade-up flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} image={user.image} size={56} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{user.name}</h1>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
              <TrustBadge trust={trust} />
              {trust.count > 0 && (
                <>
                  <Stars value={trust.average} size={11} /> {trust.count} dojmova
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-10">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs text-muted">{s.label}</p>
              <p className="mt-0.5 text-xl font-medium tabular-nums">{s.value}</p>
            </div>
          ))}
          <div className="hidden w-36 sm:block">
            <TrustMeter trust={trust} />
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between gap-4 border-b border-line">
        <DashboardTabs
          active={tab}
          tabs={[
            { key: "aktivni", label: "Oglasi", count: counts[0] },
            { key: "zavrseno", label: "Završeno", count: counts[1] },
            { key: "sacuvano", label: "Sačuvano", count: counts[2] },
            { key: "dojmovi", label: "Dojmovi", count: counts[3] },
          ]}
        />
        <Link href="/oglasi/novi" className="mb-2 hidden text-sm font-medium underline-offset-4 hover:underline sm:block">
          + Novi oglas
        </Link>
      </div>

      <div className="mt-8">
        <Suspense key={tab} fallback={<ListingGridSkeleton count={5} />}>
          {tab === "aktivni" && <MyListings userId={user.id} />}
          {tab === "zavrseno" && <SoldListings userId={user.id} />}
          {tab === "sacuvano" && <Liked userId={user.id} />}
          {tab === "dojmovi" && <Reviews userId={user.id} />}
        </Suspense>
      </div>
    </div>
  );
}

async function MyListings({ userId }: { userId: string }) {
  const listings = await prisma.listing.findMany({
    where: { sellerId: userId, status: { not: "SOLD" } },
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      _count: { select: { likes: true, conversations: true } },
      conversations: { select: { buyer: { select: { id: true, name: true } } } },
    },
  });

  if (listings.length === 0) {
    return <EmptyState icon={<Shirt />} title="Još nemaš oglasa" text="Slikaj nešto što više ne nosiš i objavi za minut." action={<Link href="/oglasi/novi" className={linkButton.primary}>Objavi oglas</Link>} />;
  }

  return (
    <ul className="divide-y divide-line">
      {listings.map((l, i) => (
        <li key={l.id} className="animate-fade-up flex flex-col gap-4 py-4 sm:flex-row sm:items-center" style={{ animationDelay: `${i * 30}ms` }}>
          <Link href={`/oglasi/${l.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
            <img src={l.images[0]?.url} alt="" className="h-20 w-16 shrink-0 rounded-md bg-subtle object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium group-hover:underline">{l.title}</p>
              <p className="mt-0.5 text-sm">{formatPrice(l.price)}</p>
              <p className="mt-1 text-xs text-muted">
                {l.status === "RESERVED" && <span className="text-ink">Rezervisano · </span>}
                {l.views} pregleda · {l._count.likes} sačuvano · {l._count.conversations} poruka · {timeAgo(l.createdAt)}
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-1.5">
            <Link href={`/oglasi/${l.id}/uredi`} className="inline-flex h-8 items-center rounded-none border border-line px-3.5 text-[13px] font-medium transition-colors hover:border-ink">
              Uredi
            </Link>
            <OwnerActions compact listingId={l.id} status={l.status} buyers={[...new Map(l.conversations.map((c) => [c.buyer.id, c.buyer])).values()]} />
          </div>
        </li>
      ))}
    </ul>
  );
}

async function SoldListings({ userId }: { userId: string }) {
  const listings = await prisma.listing.findMany({
    where: { OR: [{ sellerId: userId, status: "SOLD" }, { buyerId: userId }] },
    orderBy: { soldAt: "desc" },
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      reviews: { where: { authorId: userId }, select: { id: true } },
    },
  });

  if (listings.length === 0) {
    return <EmptyState icon={<Package />} title="Ništa završeno" text="Kad nešto prodaš ili kupiš, pojavit će se ovdje i moći ćeš ostaviti dojam." />;
  }

  return (
    <ul className="divide-y divide-line">
      {listings.map((l, i) => {
        const sold = l.sellerId === userId;
        const other = sold ? l.buyer : l.seller;
        return (
          <li key={l.id} className="animate-fade-up flex flex-col gap-4 py-4 sm:flex-row sm:items-center" style={{ animationDelay: `${i * 30}ms` }}>
            <Link href={`/oglasi/${l.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
              <img src={l.images[0]?.url} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover opacity-70" />
              <div className="min-w-0">
                <p className="text-xs text-muted">{sold ? "Prodaja" : "Kupovina"}</p>
                <p className="truncate text-sm font-medium group-hover:underline">{l.title}</p>
                <p className="mt-0.5 text-sm">
                  {formatPrice(l.price)} <span className="text-xs text-muted">{l.soldAt && `· ${timeAgo(l.soldAt)}`}</span>
                </p>
              </div>
            </Link>
            {other ? (
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/korisnici/${other.id}`} className="flex items-center gap-2 text-muted hover:text-ink">
                  <Avatar name={other.name} image={other.image} size={22} />
                  {other.name}
                </Link>
                {l.reviews.length ? <span className="text-xs text-muted">Dojam ostavljen</span> : <ReviewForm targetId={other.id} targetName={other.name} listingId={l.id} />}
              </div>
            ) : (
              <p className="text-xs text-muted">Prodano van aplikacije</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

async function Liked({ userId }: { userId: string }) {
  const likes = await prisma.like.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { listing: { select: listingCardSelect } } });
  if (likes.length === 0) {
    return <EmptyState icon={<Heart />} title="Ništa sačuvano" text="Klikni srce na artiklu da ga sačuvaš za kasnije." action={<Link href="/" className={linkButton.outline}>Pregledaj artikle</Link>} />;
  }
  return (
    <ListingGrid>
      {likes.map(({ listing }, i) => (
        <ListingCard key={listing.id} listing={listing} liked index={i} />
      ))}
    </ListingGrid>
  );
}

async function Reviews({ userId }: { userId: string }) {
  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, image: true } }, listing: { select: { id: true, title: true } } },
  });
  if (reviews.length === 0) return <EmptyState icon={<Star />} title="Još nema dojmova" text="Nakon prve kupovine ili prodaje druga strana može ostaviti dojam o tebi." />;
  return <ReviewList reviews={reviews} />;
}
