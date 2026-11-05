"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { resendLoginCode, verifyLoginCode } from "@/app/actions/login-code";
import { AuthTransition, TRANSITION_MS } from "@/components/auth-transition";
import { Button } from "@/components/ui";
import { signOut } from "@/lib/auth-client";
import { cn, wait } from "@/lib/utils";

const LENGTH = 6;
const RESEND_SECONDS = 60;

type Props = { email: string; callbackURL: string; initialCode: string };

export function CodeForm({ email, callbackURL, initialCode }: Props) {
  const router = useRouter();
  const start = /^\d{6}$/.test(initialCode) ? initialCode.split("") : Array<string>(LENGTH).fill("");
  const [digits, setDigits] = useState(start);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [info, setInfo] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const submitted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(code: string) {
    if (submitted.current) return;
    submitted.current = true;
    setLoading(true);
    setError(null);
    const res = await verifyLoginCode(code);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      setDigits(Array(LENGTH).fill(""));
      submitted.current = false;
      inputs.current[0]?.focus();
      return;
    }
    setDone(true);
    try {
      router.prefetch(callbackURL);
      await wait(TRANSITION_MS);
    } finally {
      router.push(callbackURL);
      router.refresh();
    }
  }

  // Link iz maila dolazi s ?kod=, pa odmah potvrđujemo
  useEffect(() => {
    if (!start.every(Boolean)) {
      inputs.current[0]?.focus();
      return;
    }
    const t = setTimeout(() => void submit(start.join("")), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fill(from: number, value: string) {
    const chars = value.replace(/\D/g, "").slice(0, LENGTH - from).split("");
    if (!chars.length) return;
    const next = [...digits];
    chars.forEach((c, i) => (next[from + i] = c));
    setDigits(next);
    inputs.current[Math.min(from + chars.length, LENGTH - 1)]?.focus();
    if (next.every(Boolean)) void submit(next.join(""));
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      inputs.current[i - 1]?.focus();
    }
  }

  async function resend() {
    setInfo(null);
    setError(null);
    const res = await resendLoginCode();
    if (res.error) setError(res.error);
    else {
      setInfo("Poslali smo novi kod.");
      setCooldown(RESEND_SECONDS);
    }
  }

  return (
    <>
      {done && <AuthTransition />}
      <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-ink text-white">
        <ShieldCheck className="size-5" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Potvrdi prijavu</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted">
        Poslali smo 6-cifreni kod na <span className="font-medium text-ink">{email}</span>. Upiši ga ili klikni &quot;Verifikuj svoj nalog&quot; u mailu.
      </p>

      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (digits.every(Boolean)) void submit(digits.join(""));
        }}
      >
        <div className="flex justify-between gap-2" onPaste={(e) => (e.preventDefault(), fill(0, e.clipboardData.getData("text")))}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChange={(e) => fill(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={LENGTH}
              aria-label={`Cifra ${i + 1}`}
              disabled={loading}
              className={cn(
                "h-14 w-full min-w-0 border bg-white text-center text-xl font-semibold transition-colors outline-none focus:border-ink",
                error ? "border-red-400" : "border-line",
              )}
            />
          ))}
        </div>
        {error && <p className="animate-fade-up mt-3 text-sm text-red-600">{error}</p>}
        {info && !error && <p className="animate-fade-up mt-3 text-sm text-muted">{info}</p>}
        <Button type="submit" className="mt-6 w-full" size="lg" loading={loading} disabled={!digits.every(Boolean)}>
          Potvrdi
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-[13px] text-muted">
        <button type="button" onClick={resend} disabled={cooldown > 0} className="hover:text-ink disabled:cursor-not-allowed disabled:opacity-60">
          {cooldown > 0 ? `Novi kod za ${cooldown}s` : "Pošalji novi kod"}
        </button>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/prijava");
            router.refresh();
          }}
          className="hover:text-ink"
        >
          Odustani
        </button>
      </div>
    </>
  );
}
