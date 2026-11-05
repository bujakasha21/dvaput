"use server";

import { getRawSession } from "@/lib/auth";
import { canResendLoginCode, checkLoginCode, sendLoginCode } from "@/lib/login-code";

export async function verifyLoginCode(code: string): Promise<{ error?: string; ok?: true }> {
  const session = await getRawSession();
  if (!session) return { error: "Sesija je istekla. Prijavi se ponovo." };
  if (!session.session.pendingVerification) return { ok: true };

  const result = await checkLoginCode(session.session.id, code.trim());
  if (result === "ok") return { ok: true };
  if (result === "expired") return { error: "Kod je istekao ili je previše pokušaja. Zatraži novi kod." };
  return { error: "Pogrešan kod. Pokušaj ponovo." };
}

export async function resendLoginCode(): Promise<{ error?: string }> {
  const session = await getRawSession();
  if (!session?.session.pendingVerification) return { error: "Sesija je istekla. Prijavi se ponovo." };
  if (!(await canResendLoginCode(session.session.id))) return { error: "Sačekaj minutu prije novog koda." };
  await sendLoginCode(session.session.id, session.user.id);
  return {};
}
