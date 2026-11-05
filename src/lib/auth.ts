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
    requireEmailVerification: true,
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
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Potvrdi email – Dvaput",
        text: `Zdravo ${user.name},\n\nKlikni na link da potvrdiš email adresu (važi 24h):\n${url}\n\nAko nisi pravio/la račun na Dvaput, ignoriši ovaj mail.`,
        html: `<p>Zdravo ${user.name},</p><p>Klikni na dugme da potvrdiš email adresu (link važi 24h):</p><p><a href="${url}" style="background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Potvrdi email</a></p><p style="color:#888">Ako nisi pravio/la račun na Dvaput, ignoriši ovaj mail.</p>`,
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
  databaseHooks: {
    session: {
      create: {
        // Sesija iz Google prijave ne vrijedi dok korisnik ne unese kod iz maila (/potvrda)
        before: async (session, ctx) => {
          const path = ctx?.path ?? "";
          if (path.startsWith("/callback") || path === "/sign-in/social") return { data: { ...session, pendingVerification: true } };
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

/** Sesija koja čeka kod iz maila (Google prijava) se ovdje ne računa kao prijava */
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
