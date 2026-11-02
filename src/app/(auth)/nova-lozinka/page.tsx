import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Nova šifra" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/nova-lozinka">) {
  const { token, error } = await searchParams;

  if (error || typeof token !== "string") {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Link nije važeći</h1>
        <p className="mt-2 text-sm text-muted">Link za reset je istekao ili je već iskorišten.</p>
        <Link href="/zaboravljena-lozinka" className="mt-6 inline-block text-sm underline underline-offset-4">
          Zatraži novi link →
        </Link>
      </div>
    );
  }

  return <ResetForm token={token} />;
}
