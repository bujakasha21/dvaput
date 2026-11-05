import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { sendMail } from "./mail";
import { sendLoginCode } from "./login-code";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset šifre – Dvaput",
        text: `Zdravo ${user.name},\n\nKlikni na link da postaviš novu šifru (važi 1h):\n${url}\n\nAko nisi tražio/la reset, ignoriši ovaj mail.`,
        html: `<p>Zdravo ${user.name},</p><p>Klikni na dugme da postaviš novu šifru (link važi 1h):</p><p><a href="${url}" style="background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Postavi novu šifru</a></p><p style="color:#888">Ako nisi tražio/la reset, ignoriši ovaj mail.</p>`,
      });
    },
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  session: {
    additionalFields: {
      pendingVerification: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  account: {
    accountLinking: {
      // Google se smije vezati i za nepotvrđen nalog sa šifrom; šifru tada brišemo (hook ispod)
      requireLocalEmailVerified: false,
    },
  },
  databaseHooks: {
    account: {
      create: {
        // Ako je neko registrovao tuđi email sa šifrom pa vlasnik uđe Googleom, napadačeva šifra ne smije ostati
        after: async (account) => {
          if (account.providerId === "credential") return;
          const user = await prisma.user.findUnique({ where: { id: account.userId }, select: { emailVerified: true } });
          if (user && !user.emailVerified) await prisma.account.deleteMany({ where: { userId: account.userId, providerId: "credential" } });
        },
      },
    },
    session: {
      create: {
        // Sesija ne vrijedi dok korisnik ne unese kod iz maila (/potvrda):
        // Google prijava uvijek, prijava šifrom dok email nije potvrđen
        before: async (session, ctx) => {
          const path = ctx?.path ?? "";
          const oauth = path.startsWith("/callback") || path === "/sign-in/social";
          const user = oauth ? null : await prisma.user.findUnique({ where: { id: session.userId }, select: { emailVerified: true } });
          if (oauth || (user && !user.emailVerified)) return { data: { ...session, pendingVerification: true } };
        },
        after: async (session) => {
          if (session.pendingVerification) await sendLoginCode(session.id, session.userId);
        },
      },
    },
  },
  user: {
    additionalFields: {
      bio: { type: "string", required: false, input: true },
      city: { type: "string", required: false, input: true },
    },
  },
  // Greške OAuth callbacka (npr. account_not_linked) idu na prijavu s porukom umjesto na /api/auth/error
  onAPIError: { errorURL: "/prijava" },
  plugins: [nextCookies()],
});

export const isGoogleEnabled = googleEnabled;

/** Sesija koja čeka kod iz maila (/potvrda) se ovdje ne računa kao prijava */
export async function getSession() {
  const session = await getRawSession();
  return session?.session.pendingVerification ? null : session;
}

export async function getRawSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session.user;
}
