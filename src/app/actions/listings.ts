"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Category, Condition, Gender, ListingStatus } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_IMAGES } from "@/lib/constants";

const listingSchema = z.object({
  title: z.string().trim().min(3, "Naslov je prekratak").max(80, "Najviše 80 znakova"),
  description: z.string().trim().min(10, "Opiši artikal sa barem 10 znakova").max(2000),
  price: z.coerce.number({ error: "Unesi cijenu" }).int("Cijena mora biti cijeli broj").min(1, "Cijena mora biti veća od 0").max(100000),
  category: z.enum(Category, { error: "Izaberi kategoriju" }),
  gender: z.enum(Gender),
  condition: z.enum(Condition, { error: "Izaberi stanje" }),
  size: z.string().trim().max(20).optional(),
  brand: z.string().trim().max(40).optional(),
  color: z.string().trim().max(30).optional(),
  material: z.string().trim().max(40).optional(),
  city: z.string().trim().max(40).optional(),
  negotiable: z.boolean(),
  shipping: z.boolean(),
  images: z
    .array(z.string().regex(/^(\/uploads\/[\w-]+\.(webp|jpe?g|png)|https:\/\/images\.unsplash\.com\/.+|https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/listings\/[\w-]+\.(webp|jpe?g|png))$/))
    .min(1, "Dodaj barem jednu sliku")
    .max(MAX_IMAGES, `Najviše ${MAX_IMAGES} slika`),
});

export type ListingFormState = { errors?: Record<string, string>; message?: string } | undefined;

function parse(formData: FormData) {
  const empty = (v: FormDataEntryValue | null) => (v === null || v === "" ? undefined : String(v));
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: empty(formData.get("category")),
    gender: formData.get("gender") ?? "UNISEX",
    condition: empty(formData.get("condition")),
    size: empty(formData.get("size")),
    brand: empty(formData.get("brand")),
    color: empty(formData.get("color")),
    material: empty(formData.get("material")),
    city: empty(formData.get("city")),
    negotiable: formData.get("negotiable") === "on",
    shipping: formData.get("shipping") === "on",
    images: formData.getAll("images").map(String),
  });
}

function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    errors[key] ??= issue.message;
  }
  return errors;
}

export async function saveListing(listingId: string | null, _prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const session = await getSession();
  if (!session) redirect("/prijava");

  const parsed = parse(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Provjeri označena polja." };

  const { images, ...data } = parsed.data;
  const imageRows = images.map((url, position) => ({ url, position }));

  let id = listingId;
  if (listingId) {
    const existing = await prisma.listing.findUnique({ where: { id: listingId }, select: { sellerId: true } });
    if (!existing || existing.sellerId !== session.user.id) return { message: "Nemaš pravo uređivati ovaj oglas." };
    await prisma.$transaction([
      prisma.listingImage.deleteMany({ where: { listingId } }),
      prisma.listing.update({ where: { id: listingId }, data: { ...data, images: { create: imageRows } } }),
    ]);
  } else {
    const listing = await prisma.listing.create({
      data: { ...data, sellerId: session.user.id, images: { create: imageRows } },
    });
    id = listing.id;
  }

  revalidatePath("/");
  revalidatePath("/moj-ormar");
  redirect(`/oglasi/${id}?saved=1`);
}

async function ownListing(listingId: string) {
  const session = await getSession();
  if (!session) redirect("/prijava");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { sellerId: true } });
  if (!listing || listing.sellerId !== session.user.id) throw new Error("FORBIDDEN");
  return session.user;
}

export async function deleteListing(listingId: string) {
  await ownListing(listingId);
  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/");
  revalidatePath("/moj-ormar");
}

export async function setListingStatus(listingId: string, status: ListingStatus, buyerId?: string | null) {
  await ownListing(listingId);
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status,
      soldAt: status === "SOLD" ? new Date() : null,
      buyerId: status === "SOLD" ? (buyerId ?? null) : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/moj-ormar");
  revalidatePath(`/oglasi/${listingId}`);
}

export async function toggleLike(listingId: string): Promise<{ liked: boolean } | { error: "auth" }> {
  const session = await getSession();
  if (!session) return { error: "auth" };
  const key = { userId_listingId: { userId: session.user.id, listingId } };
  const existing = await prisma.like.findUnique({ where: key });
  if (existing) await prisma.like.delete({ where: key });
  else await prisma.like.create({ data: { userId: session.user.id, listingId } });
  revalidatePath("/moj-ormar");
  return { liked: !existing };
}
