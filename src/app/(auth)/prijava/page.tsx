import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isGoogleEnabled } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Prijava" };

export default async function LoginPage({ searchParams }: PageProps<"/prijava">) {
  const { next, error } = await searchParams;
  const callbackURL = typeof next === "string" && next.startsWith("/") ? next : "/moj-ormar";
  if (await getSession()) redirect(callbackURL);
  return <LoginForm googleEnabled={isGoogleEnabled} callbackURL={callbackURL} oauthError={typeof error === "string" ? oauthErrorMessage(error) : null} />;
}

function oauthErrorMessage(code: string) {
  if (code === "account_not_linked")
    return "Ovaj email je već registrovan sa šifrom. Prijavi se šifrom i potvrdi email – nakon toga radi i Google prijava.";
  return "Google prijava nije uspjela. Pokušaj ponovo.";
}
