"use client";

import { MailCheck } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui";

export function CheckEmail({ email, callbackURL }: { email: string; callbackURL: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend() {
    setStatus("sending");
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="animate-fade-up text-center">
      <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-ink text-white">
        <MailCheck className="size-5" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Provjeri email</h1>
      <p className="mt-1.5 text-sm text-muted">
        Poslali smo link za potvrdu na <span className="font-medium text-ink">{email}</span>. Klikni na njega i odmah si prijavljen/a.
      </p>
      <Button type="button" variant="outline" className="mt-8 w-full" loading={status === "sending"} disabled={status === "sent"} onClick={resend}>
        {status === "sent" ? "Link je ponovo poslan" : "Pošalji link ponovo"}
      </Button>
      {status === "error" && <p className="mt-3 text-sm text-red-600">Slanje nije uspjelo, pokušaj za minutu.</p>}
      <p className="mt-6 text-xs text-muted">Ne vidiš mail? Pogledaj i u spam.</p>
    </div>
  );
}
