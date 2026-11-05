import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRawSession, isGoogleEnabled } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registracija" };

export default async function RegisterPage() {
  const session = await getRawSession();
  if (session) redirect(session.session.pendingVerification ? "/potvrda" : "/moj-ormar");
  return <RegisterForm googleEnabled={isGoogleEnabled} />;
}
