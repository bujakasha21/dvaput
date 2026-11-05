"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { GoogleButton } from "@/components/google-button";
import { Button, Field, Input } from "@/components/ui";
import { AuthTransition, TRANSITION_MS } from "@/components/auth-transition";
import { wait } from "@/lib/utils";

type Props = { googleEnabled: boolean; callbackURL: string; oauthError: string | null };

export function LoginForm({ googleEnabled, callbackURL, oauthError }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(oauthError);
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { data: result, error } = await signIn.email({
      email: String(data.get("email")),
      password: String(data.get("password")),
      rememberMe: true,
    });
    if (error) {
      setError(error.status === 401 ? "Pogrešan email ili šifra." : (error.message ?? "Nešto nije u redu."));
      setLoading(false);
      return;
    }
    // Email još nije potvrđen: sesija čeka kod iz maila
    if (!result?.user.emailVerified) {
      router.push(`/potvrda?next=${encodeURIComponent(callbackURL)}`);
      return;
    }
    setWelcome(result.user.name);
    try {
      router.prefetch(callbackURL);
      await wait(TRANSITION_MS);
    } finally {
      // Prijava je uspjela, pa preusmjeravamo i ako animacija zakaže
      router.push(callbackURL);
      router.refresh();
    }
  }

  return (
    <>
      {welcome !== null && <AuthTransition name={welcome} />}
      <h1 className="text-2xl font-semibold tracking-tight">Dobro došli nazad</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted">Prijavi se i nastavi gdje si stao/la.</p>
      <GoogleButton enabled={googleEnabled} callbackURL={callbackURL} />
      <form method="post" onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required placeholder="ime@email.com" />
        </Field>
        <Field label="Šifra">
          <Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        </Field>
        <div className="flex justify-end">
          <Link href="/zaboravljena-lozinka" className="text-[13px] text-muted hover:text-ink">
            Zaboravljena šifra?
          </Link>
        </div>
        {error && <p className="animate-fade-up text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Prijavi se
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Nemaš račun?{" "}
        <Link href="/registracija" className="text-ink underline underline-offset-4">
          Registruj se
        </Link>
      </p>
    </>
  );
}
