"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await authClient.requestPasswordReset({
      email: String(new FormData(e.currentTarget).get("email")),
      redirectTo: "/nova-lozinka",
    });
    // Uvijek prikazujemo isti odgovor da ne otkrivamo koji emailovi postoje
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 grid place-items-center text-muted">
          <MailCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Provjeri inbox</h1>
        <p className="mt-2 text-sm text-muted">Ako račun postoji, poslali smo link za reset šifre. Link važi 1 sat.</p>
        <Link href="/prijava" className="mt-6 inline-block text-sm underline underline-offset-4">
          ← Nazad na prijavu
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Zaboravljena šifra?</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted">Upiši email i poslat ćemo ti link za novu šifru.</p>
      <form method="post" onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="ime@email.com" />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Pošalji link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/prijava" className="text-muted hover:text-ink">
          ← Nazad na prijavu
        </Link>
      </p>
    </>
  );
}
