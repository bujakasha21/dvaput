import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { sendMail } from "./mail";

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
  user: {
    additionalFields: {
      bio: { type: "string", required: false, input: true },
      city: { type: "string", required: false, input: true },
    },
  },
  plugins: [nextCookies()],
});

export const isGoogleEnabled = googleEnabled;

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session.user;
}
