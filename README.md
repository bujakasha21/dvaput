<div align="center">

# Dvaput

**Wear it twice.** A full-stack marketplace for second-hand clothing, built for resellers and for anyone who wants their clothes to get a second life.

[**Live demo → dvaput.vercel.app**](https://dvaput.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)

![Home page](docs/home.jpg)

</div>

> **Try it:** sign in with the demo account `demo@dvaput.ba` / `demo1234`, or continue with Google.
> The UI is in Bosnian/Serbian (the target market), including the URLs (`/oglasi/novi`, `/moj-ormar`, `/poruke`).

---

## Features

**Browsing and buying**
- Home page with an autoplaying hero banner and category rows (New in, Women, Men, Kids, Sneakers, Jackets).
- Category pages with filters (type, gender, condition, price range), sorting and search.
- Listing page with an image slider (up to 5 photos), condition, size, brand, color, material, city, shipping and "negotiable" flags, plus comments.
- Likes with optimistic UI, collected under *Saved*.
- **Buyer ↔ seller chat** tied to a listing, with unread badges.

**Selling**
- A 6-step listing form with a **live preview** and a progress bar, plus drag & drop upload. Images are compressed in the browser to WEBP (max 1600 px) before upload.
- Seller dashboard: active listings, completed sales and purchases, saved items, reviews, and stats (earned, sold, rating).
- Listing status: active, reserved or sold. When marking an item as sold, the seller picks the buyer.

**Trust**
- After a conversation, buyer and seller can review each other (1–5 stars plus a comment).
- A trust level is computed from reviews: *New*, *Caution*, *Trusted* or *Highly trusted*. It is shown on profiles and listings.

**Accounts**
- Email/password and **Google sign-in**, with a skeleton "welcome" transition into the dashboard.
- Password reset by email.
- Public profiles and profile settings.

<table>
  <tr>
    <td width="62%"><img src="docs/listing.jpg" alt="Listing page" /></td>
    <td><img src="docs/mobile.jpg" alt="Mobile home" /></td>
    <td><img src="docs/mobile-menu.jpg" alt="Mobile menu" /></td>
  </tr>
</table>

---

## Tech stack

| | |
|---|---|
| Framework | **Next.js 16**: App Router, Server Components, Server Actions, Turbopack, `proxy.ts` |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS 4** with design tokens in `@theme`; a monochrome, editorial look with sharp corners |
| Database | **PostgreSQL** via **Prisma 6**: Neon in production, embedded Postgres locally |
| Auth | **better-auth**: email/password, Google OAuth, password reset, session cookies |
| Validation | **zod** on every Server Action |
| Storage | **Vercel Blob** for listing photos in production, local disk in development |
| UI | motion (animations), embla-carousel (sliders), lucide-react (icons), sonner (toasts) |
| Hosting | **Vercel** (`fra1`), with the database and blob store in the same region |

## Implementation notes

- **Server-first.** Pages are async Server Components that query Prisma directly. Mutations are Server Actions validated with zod and followed by `revalidatePath`, so no separate REST layer is needed.
- **Streaming.** Home rows and filtered lists are wrapped in `Suspense` with skeleton fallbacks, so the shell renders immediately.
- **Auth guard.** `proxy.ts` does an optimistic cookie check and redirects to `/prijava?next=…`. The real session check happens on the server in every page and action.
- **Optimistic UI.** Likes use `useOptimistic`. The listing form submits manually so React does not reset fields when validation fails.
- **Uploads.** Images are compressed client-side and sent to `/api/upload`, which writes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set and to `storage/uploads` otherwise. The listing schema only accepts URLs from these sources.
- **Chat.** Polls `/api/conversations/[id]/messages?after=` every 3 s and marks messages read when they are seen.
- **Localized routes.** All URLs are in the local language. The old English paths 301-redirect via `next.config.ts`.
- **Zero-setup local DB.** `npm run db` starts a real PostgreSQL through `embedded-postgres`, so no Docker or Homebrew is needed.

---

## Getting started

Requires **Node.js 20+**.

```bash
git clone https://github.com/bujakasha21/dvaput.git
cd dvaput
npm install
cp .env.example .env        # set BETTER_AUTH_SECRET (openssl rand -hex 32)
```

Terminal 1 starts a local PostgreSQL on port 5433 (data lives in `./.pgdata`):

```bash
npm run db
```

Terminal 2:

```bash
npm run db:push             # create tables from prisma/schema.prisma
npm run db:seed             # demo users and listings (wipes existing data)
npm run dev                 # http://localhost:3000
```

Seeded accounts (password `demo1234`): `demo@dvaput.ba`, `ana@demo.ba`, `marko@demo.ba`, `lejla@demo.ba`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | production build / start |
| `npm run lint` | ESLint |
| `npm run db` | local embedded PostgreSQL |
| `npm run db:push` | sync the Prisma schema to the database |
| `npm run db:seed` | seed demo data |
| `npm run db:studio` | Prisma Studio |

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (locally `postgresql://dvaput:dvaput@localhost:5433/dvaput`) |
| `BETTER_AUTH_SECRET` | session secret: `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | app URL (`http://localhost:3000` locally) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional. Google sign-in is enabled when both are set. Redirect URI: `<app url>/api/auth/callback/google` |
| `BLOB_READ_WRITE_TOKEN` | optional. Enables Vercel Blob uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | optional. Without SMTP, reset links are printed to the server console |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional. Contact email shown on the privacy and terms pages |

---

## Project structure

```
prisma/
  schema.prisma        users, sessions, listings, images, likes, comments, reviews, conversations, messages
  seed.ts              demo data
scripts/db.mjs         embedded PostgreSQL for local development
src/
  proxy.ts             redirects signed-out users away from protected routes
  lib/                 auth (server + client), Prisma client, shared queries, trust level, categories
  app/
    page.tsx           home (banner + category rows)
    kategorije/[slug]  category pages with filters
    oglasi/            listing detail, new listing, edit listing
    moj-ormar/         seller dashboard + settings
    poruke/            conversations + chat
    korisnici/[id]     public profile with reviews
    (auth)/            sign in, sign up, forgot / reset password
    actions/           Server Actions (listings, likes, comments, reviews, chat, profile)
    api/               auth handler, image upload, chat polling
  components/          navbar, banner, cards, forms, sliders, UI primitives
```

## Deployment

The live demo runs on **Vercel** with a **Neon** Postgres database and a **Vercel Blob** store, all in Frankfurt.
Pushing to `main` deploys automatically. To apply schema changes to the production database, run:

```bash
DATABASE_URL="<neon unpooled url>" npx prisma db push
```

## Roadmap

- [ ] Offers ("make an offer" below the asking price)
- [ ] Email / push notifications for messages and likes
- [ ] Real-time chat (WebSockets) instead of polling
- [ ] Follow sellers, personalized feed
- [ ] Reporting and moderation
