import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Postavke" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/prijava?next=/moj-ormar/podesavanja");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { name: true, email: true, city: true, bio: true } });

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight">Postavke profila</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted">Ovo vide kupci i prodavači na tvom profilu.</p>
      <SettingsForm user={user} />
    </div>
  );
}
