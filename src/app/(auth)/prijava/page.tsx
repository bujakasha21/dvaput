import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isGoogleEnabled } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Prijava" };

export default async function LoginPage({ searchParams }: PageProps<"/prijava">) {
  const { next } = await searchParams;
  const callbackURL = typeof next === "string" && next.startsWith("/") ? next : "/moj-ormar";
  if (await getSession()) redirect(callbackURL);
  return <LoginForm googleEnabled={isGoogleEnabled} callbackURL={callbackURL} />;
}
