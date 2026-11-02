"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/social";
import { Button, Field, Input, Textarea } from "@/components/ui";

export function SettingsForm({ user }: { user: { name: string; email: string; city: string | null; bio: string | null } }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Profil sačuvan");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action}>
      <div className="space-y-5">
        <Field label="Ime i prezime">
          <Input name="name" defaultValue={user.name} required minLength={2} maxLength={60} />
        </Field>
        <Field label="Email" hint="Email se ne može mijenjati.">
          <Input value={user.email} disabled className="opacity-60" />
        </Field>
        <Field label="Grad">
          <Input name="city" defaultValue={user.city ?? ""} placeholder="Sarajevo" maxLength={40} />
        </Field>
        <Field label="O meni" hint="npr. Reseller vintage odjeće, šaljem brzom poštom.">
          <Textarea name="bio" defaultValue={user.bio ?? ""} maxLength={300} />
        </Field>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
          <Link href="/zaboravljena-lozinka" className="text-[13px] text-muted hover:text-ink">Promijeni šifru →</Link>
          <Button type="submit" loading={pending}>Sačuvaj</Button>
        </div>
      </div>
    </form>
  );
}
