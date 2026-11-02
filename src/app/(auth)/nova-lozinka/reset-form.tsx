"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("password"));
    if (newPassword !== data.get("confirm")) return setError("Šifre se ne poklapaju.");
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword, token });
    if (error) {
      setError("Link je istekao ili nije važeći. Zatraži novi.");
      setLoading(false);
      return;
    }
    toast.success("Šifra promijenjena. Prijavi se novom šifrom.");
    router.push("/prijava");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Nova šifra</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted">Izaberi novu šifru za svoj račun.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nova šifra" hint="Najmanje 8 znakova">
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field label="Ponovi šifru">
          <Input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sačuvaj šifru
        </Button>
      </form>
    </>
  );
}
