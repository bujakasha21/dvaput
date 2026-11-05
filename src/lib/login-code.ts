import "server-only";
import { createHash, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";
import { sendMail } from "./mail";

// Google prijava i nalog s nepotvrđenim emailom moraju unijeti 6-cifreni kod iz maila prije nego što sesija vrijedi.
// Kod je u tabeli verification (hash + broj pokušaja), vezan za konkretnu sesiju.

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60 * 1000;

const identifier = (sessionId: string) => `login-code:${sessionId}`;
const hash = (code: string) => createHash("sha256").update(`${code}:${process.env.BETTER_AUTH_SECRET}`).digest("hex");

export async function sendLoginCode(sessionId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (!user) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.verification.deleteMany({ where: { identifier: identifier(sessionId) } });
  await prisma.verification.create({
    data: { id: randomUUID(), identifier: identifier(sessionId), value: `${hash(code)}:0`, expiresAt: new Date(Date.now() + TTL_MS) },
  });

  const url = `${process.env.BETTER_AUTH_URL}/potvrda?kod=${code}`;
  await sendMail({
    to: user.email,
    subject: `${code} je tvoj kod za potvrdu – Dvaput`,
    text: `Zdravo ${user.name},\n\nTvoj kod za potvrdu naloga: ${code}\n\nIli otvori link u istom browseru:\n${url}\n\nKod važi 10 minuta. Ako se nisi ti prijavljivao/la, ignoriši ovaj mail.`,
    html: `<p>Zdravo ${user.name},</p><p>Tvoj kod za potvrdu naloga:</p><p style="font-size:28px;font-weight:600;letter-spacing:6px;margin:8px 0 20px">${code}</p><p><a href="${url}" style="background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Verifikuj svoj nalog</a></p><p style="color:#888">Kod važi 10 minuta. Ako se nisi ti prijavljivao/la, ignoriši ovaj mail.</p>`,
  });
}

export async function canResendLoginCode(sessionId: string) {
  const last = await prisma.verification.findFirst({ where: { identifier: identifier(sessionId) }, select: { createdAt: true } });
  return !last || Date.now() - last.createdAt.getTime() > RESEND_AFTER_MS;
}

export type CheckResult = "ok" | "wrong" | "expired";

export async function checkLoginCode(sessionId: string, code: string): Promise<CheckResult> {
  const row = await prisma.verification.findFirst({ where: { identifier: identifier(sessionId) } });
  if (!row || row.expiresAt < new Date()) return "expired";

  const [stored, attempts] = row.value.split(":");
  if (Number(attempts) >= MAX_ATTEMPTS) return "expired";

  if (/^\d{6}$/.test(code) && timingSafeEqual(Buffer.from(stored), Buffer.from(hash(code)))) {
    await prisma.$transaction([
      prisma.verification.delete({ where: { id: row.id } }),
      prisma.session.update({ where: { id: sessionId }, data: { pendingVerification: false, user: { update: { emailVerified: true } } } }),
    ]);
    return "ok";
  }

  await prisma.verification.update({ where: { id: row.id }, data: { value: `${stored}:${Number(attempts) + 1}` } });
  return Number(attempts) + 1 >= MAX_ATTEMPTS ? "expired" : "wrong";
}
