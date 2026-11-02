"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function userOrLogin(next?: string) {
  const session = await getSession();
  if (!session) redirect(next ? `/prijava?next=${encodeURIComponent(next)}` : "/prijava");
  return session.user;
}

// ---------- Komentari ----------

export async function addComment(listingId: string, body: string): Promise<{ error?: string }> {
  const user = await userOrLogin(`/oglasi/${listingId}`);
  const text = body.trim();
  if (text.length < 2) return { error: "Komentar je prekratak." };
  if (text.length > 500) return { error: "Najviše 500 znakova." };
  await prisma.comment.create({ data: { listingId, authorId: user.id, body: text } });
  revalidatePath(`/oglasi/${listingId}`);
  return {};
}

export async function deleteComment(commentId: string) {
  const user = await userOrLogin();
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { listing: { select: { sellerId: true } } } });
  // Autor komentara ili vlasnik oglasa može obrisati komentar
  if (!comment || (comment.authorId !== user.id && comment.listing.sellerId !== user.id)) return;
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/oglasi/${comment.listingId}`);
}

// ---------- Dojmovi ----------

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().max(500).optional(),
});

/** Dojam se može ostaviti samo osobi s kojom postoji razgovor oko oglasa, jednom po oglasu. */
export async function addReview(targetId: string, listingId: string, input: { rating: number; body?: string }): Promise<{ error?: string }> {
  const user = await userOrLogin();
  if (user.id === targetId) return { error: "Ne možeš ocijeniti sebe." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "Izaberi ocjenu od 1 do 5." };

  const conversation = await prisma.conversation.findFirst({
    where: {
      listingId,
      OR: [
        { buyerId: user.id, sellerId: targetId },
        { buyerId: targetId, sellerId: user.id },
      ],
    },
    select: { id: true },
  });
  if (!conversation) return { error: "Dojam možeš ostaviti samo nakon razgovora o oglasu." };

  const exists = await prisma.review.findFirst({ where: { authorId: user.id, targetId, listingId } });
  if (exists) return { error: "Već si ostavio/la dojam za ovaj oglas." };

  await prisma.review.create({ data: { authorId: user.id, targetId, listingId, rating: parsed.data.rating, body: parsed.data.body || null } });
  revalidatePath(`/korisnici/${targetId}`);
  revalidatePath("/moj-ormar");
  return {};
}

// ---------- Chat ----------

export async function startConversation(listingId: string) {
  const user = await userOrLogin(`/oglasi/${listingId}`);
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { sellerId: true } });
  if (!listing) redirect("/");
  if (listing.sellerId === user.id) redirect("/poruke");

  const conversation = await prisma.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId: user.id } },
    create: { listingId, buyerId: user.id, sellerId: listing.sellerId },
    update: {},
  });
  redirect(`/poruke/${conversation.id}`);
}

export async function sendMessage(conversationId: string, body: string): Promise<{ error?: string }> {
  const user = await userOrLogin();
  const text = body.trim();
  if (!text) return { error: "Poruka je prazna." };
  if (text.length > 2000) return { error: "Poruka je preduga." };

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) return { error: "Razgovor ne postoji." };

  await prisma.$transaction([
    prisma.message.create({ data: { conversationId, senderId: user.id, body: text } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);
  return {};
}

// ---------- Profil ----------

const profileSchema = z.object({
  name: z.string().trim().min(2, "Ime je prekratko").max(60),
  city: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(300).optional(),
});

export async function updateProfile(_prev: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const user = await userOrLogin();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name, city: parsed.data.city ?? null, bio: parsed.data.bio ?? null } });
  revalidatePath("/", "layout");
  return { ok: true };
}
