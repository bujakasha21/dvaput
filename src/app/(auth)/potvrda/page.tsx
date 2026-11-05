import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRawSession } from "@/lib/auth";
import { CodeForm } from "./code-form";

export const metadata: Metadata = { title: "Potvrda naloga" };

export default async function ConfirmPage({ searchParams }: PageProps<"/potvrda">) {
  const { next, kod } = await searchParams;
  const callbackURL = typeof next === "string" && next.startsWith("/") ? next : "/moj-ormar";
  const session = await getRawSession();
  // Link iz maila otvoren u drugom browseru (npr. u mail aplikaciji) nema ovu sesiju
  if (!session) redirect(kod ? "/prijava?error=drugi_browser" : "/prijava");
  if (!session.session.pendingVerification) redirect(callbackURL);
  return <CodeForm email={session.user.email} callbackURL={callbackURL} initialCode={typeof kod === "string" ? kod : ""} />;
}
