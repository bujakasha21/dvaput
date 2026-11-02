import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isGoogleEnabled } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registracija" };

export default async function RegisterPage() {
  if (await getSession()) redirect("/moj-ormar");
  return <RegisterForm googleEnabled={isGoogleEnabled} />;
}
