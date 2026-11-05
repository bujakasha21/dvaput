"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { GoogleButton } from "@/components/google-button";
import { Button, Field, Input } from "@/components/ui";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirm")) {
      setError("Šifre se ne poklapaju.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signUp.email({
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      password,
    });
    if (error) {
      setError(error.code === "USER_ALREADY_EXISTS" || error.status === 422 ? "Račun s ovim emailom već postoji." : (error.message ?? "Registracija nije uspjela."));
      setLoading(false);
      return;
    }
    // Nov nalog: sesija čeka 6-cifreni kod iz maila (stigao je pri kreiranju sesije)
    router.push("/potvrda?next=%2Fmoj-ormar");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Napravi račun</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted">Objavi prvi oglas za manje od minute.</p>
      <GoogleButton enabled={googleEnabled} />
      <form method="post" onSubmit={onSubmit} className="space-y-4">
        <Field label="Ime i prezime">
          <Input name="name" required minLength={2} autoComplete="name" placeholder="Vaše ime i prezime" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="ime@email.com" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Šifra" hint="Najmanje 8 znakova">
            <Input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
          </Field>
          <Field label="Ponovi šifru">
            <Input name="confirm" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
          </Field>
        </div>
        {error && <p className="animate-fade-up text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Registruj se
        </Button>
        <p className="text-center text-xs text-muted">
          Registracijom prihvataš{" "}
          <Link href="/uslovi" className="underline underline-offset-4 hover:text-ink">uslove korištenja</Link> i{" "}
          <Link href="/privatnost" className="underline underline-offset-4 hover:text-ink">politiku privatnosti</Link>.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Već imaš račun?{" "}
        <Link href="/prijava" className="text-ink underline underline-offset-4">
          Prijavi se
        </Link>
      </p>
    </>
  );
}
