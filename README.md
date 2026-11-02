# Dvaput

**Nosi dvaput.** Marketplace za polovnu odjeću, za resellere i za sve koji žele da njihova odjeća dobije drugi život.

Minimalistički, editorijalni dizajn (crno-bijelo, oštri uglovi, Geist font), male animacije i skeleton kartice dok se sadržaj učitava. Sav interfejs i sve adrese su na srpskom (`/oglasi/novi`, `/moj-ormar`, `/poruke`…).

---

## Šta aplikacija radi

### Kupci
- **Početna:** veliki banner (slajder sa autoplayem), redovi po kategorijama (Novo u ponudi, Žene, Muškarci, Djeca, Patike, Jakne) sa linkom „Vidi sve".
- **Stranice kategorija** (`/kategorije/[slug]`): filteri po vrsti, za koga, stanju, cijeni, uz sortiranje i pretragu.
- **Oglas:** slajder do 5 slika, cijena, stanje, veličina, brend, boja, materijal, grad, dostava i „po dogovoru", profil prodavača sa nivoom povjerenja i komentari.
- **Lajkovi:** sačuvani oglasi su na jednom mjestu.
- **Chat sa prodavačem:** razgovor vezan za oglas, sa oznakom nepročitanih poruka.

### Prodavači
- **Prodaj** (`/oglasi/novi`): forma u 6 koraka, pregled oglasa uživo i traka napretka, drag & drop upload (slike se na klijentu smanjuju na WEBP do 1600 px).
- **Moj ormar** (`/moj-ormar`): aktivni oglasi, završene prodaje i kupovine, sačuvano, dojmovi i statistika (zarađeno, prodano, ocjena).
- **Status oglasa:** aktivan, rezervisan ili prodano. Kod prodaje se bira kupac.
- **Dojmovi i povjerenje:** nakon razgovora kupac i prodavač mogu jedno drugom ostaviti ocjenu 1–5 i komentar. Iz toga se računa nivo: *Novi*, *Oprez*, *Pouzdan* ili *Super pouzdan*.

### Nalog
- Registracija i prijava emailom i šifrom, uz animaciju prelaza na dashboard.
- Prijava preko Google naloga (uključuje se kad se upišu ključevi).
- Reset šifre emailom.
- Podešavanja profila (ime, grad, bio).

---

## Tehnologije

| | |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, Server Actions, `proxy.ts`) |
| Jezik | **TypeScript** |
| Stilovi | **Tailwind CSS 4** (`@theme` tokeni u `globals.css`) |
| Baza | **PostgreSQL** + **Prisma 6** |
| Auth | **better-auth** (email/šifra, Google OAuth, reset šifre) |
| Validacija | **zod** |
| Slike | Vercel Blob na produkciji, lokalni disk u razvoju |
| UI | motion (animacije), embla-carousel (slajderi), lucide-react (ikone), sonner (toast poruke) |
| Mail | nodemailer (SMTP). Bez SMTP-a link se ispisuje u terminal |

---

## Pokretanje lokalno

Potrebno: **Node.js 20+**. Postgres ne moraš instalirati, jer projekt sam pokreće lokalni server (`embedded-postgres`).

```bash
git clone https://github.com/bujakasha21/dvaput.git
cd dvaput
npm install
cp .env.example .env          # pa upiši BETTER_AUTH_SECRET (openssl rand -hex 32)
```

U **prvom terminalu** pokreni bazu i ostavi je da radi:

```bash
npm run db                    # PostgreSQL na portu 5433, podaci u ./.pgdata
```

U **drugom terminalu**:

```bash
npm run db:push               # kreira tabele iz prisma/schema.prisma
npm run db:seed               # demo korisnici i oglasi (BRIŠE postojeće podatke!)
npm run dev                   # http://localhost:3000
```

Demo nalozi iz seeda (šifra `demo1234`): `demo@dvaput.ba`, `ana@demo.ba`, `marko@demo.ba`, `lejla@demo.ba`.

Ako već imaš svoj Postgres, preskoči `npm run db` i upiši njegov `DATABASE_URL` u `.env`.

### Skripte

| Komanda | Šta radi |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | produkcijski build i pokretanje |
| `npm run lint` | ESLint |
| `npm run db` | lokalni PostgreSQL (embedded) |
| `npm run db:push` | sinhronizuje šemu sa bazom |
| `npm run db:seed` | puni bazu demo podacima |
| `npm run db:studio` | Prisma Studio, pregled baze u browseru |

---

## Varijable okruženja (`.env`)

| Varijabla | Opis |
|---|---|
| `DATABASE_URL` | Postgres konekcija. Lokalno: `postgresql://dvaput:dvaput@localhost:5433/dvaput` |
| `BETTER_AUTH_SECRET` | tajni ključ za sesije: `openssl rand -hex 32` |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | adresa aplikacije (`http://localhost:3000`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google prijava (opcionalno, vidi ispod) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | slanje maila za reset šifre (opcionalno) |

### Google prijava
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials), pa *Create credentials* i *OAuth client ID* (tip *Web application*).
2. *Authorized redirect URI*: `http://localhost:3000/api/auth/callback/google` (za produkciju dodaj i svoju domenu).
3. Upiši ID i secret u `.env` i restartuj `npm run dev`. Dugme „Nastavi s Google" se tada uključuje.

---

## Struktura projekta

```
prisma/
  schema.prisma          korisnici, sesije, oglasi, slike, lajkovi, komentari, dojmovi, razgovori, poruke
  seed.ts                demo podaci
scripts/db.mjs           lokalni embedded PostgreSQL
src/
  proxy.ts               preusmjerava neprijavljene sa zaštićenih ruta na /prijava
  lib/
    auth.ts              better-auth konfiguracija (server)
    auth-client.ts       better-auth klijent
    queries.ts           zajednički upiti, nivo povjerenja
    collections.ts       kategorije i kolekcije (slugovi za /kategorije/*)
    constants.ts         nazivi kategorija, stanja, veličine
  app/
    page.tsx             početna (banner + redovi po kategorijama)
    kategorije/[slug]/   lista sa filterima
    oglasi/[id]/         oglas, komentari, akcije vlasnika
    oglasi/novi/         nova objava
    oglasi/[id]/uredi/   izmjena oglasa
    moj-ormar/           dashboard + podešavanja
    poruke/              lista razgovora + chat
    korisnici/[id]/      javni profil i dojmovi
    (auth)/              prijava, registracija, zaboravljena i nova lozinka
    actions/             server akcije (oglasi, lajkovi, komentari, dojmovi, chat, profil)
    api/upload           upload slika → storage/uploads
    api/conversations    polling novih poruka (svake 3 s)
    uploads/[file]       servira uploadovane slike
  components/            navbar, banner, kartice, forme, slajderi, UI primitivi
```

### Rute

| Adresa | Stranica |
|---|---|
| `/` | početna |
| `/kategorije/sve`, `/kategorije/zene`, `/kategorije/patike`… | liste sa filterima |
| `/oglasi/[id]` | oglas |
| `/oglasi/novi`, `/oglasi/[id]/uredi` | objava i izmjena (prijava obavezna) |
| `/moj-ormar`, `/moj-ormar?tab=zavrseno\|sacuvano\|dojmovi`, `/moj-ormar/podesavanja` | dashboard |
| `/poruke`, `/poruke/[id]` | chat |
| `/korisnici/[id]` | javni profil |
| `/prijava`, `/registracija`, `/zaboravljena-lozinka`, `/nova-lozinka` | nalog |

Stare engleske adrese (`/login`, `/dashboard`, `/listings/…`) trajno (301) preusmjeravaju na nove, a podešene su u `next.config.ts`.

---

## Deploy (Vercel + Neon)

Produkcija: **https://dvaput.vercel.app**

- Baza je **Neon** (Vercel → Storage → `dvaput-db`, region Frankfurt). Integracija sama postavlja `DATABASE_URL` i ostale `PG*` varijable.
- Na Vercelu treba ručno postaviti `BETTER_AUTH_SECRET` i `BETTER_AUTH_URL` (`https://dvaput.vercel.app`).
- Slike oglasa idu na **Vercel Blob** (`dvaput-blob`, Frankfurt, public) kad postoji `BLOB_READ_WRITE_TOKEN`. Lokalno se spremaju u `storage/uploads`.
- Funkcije rade u `fra1` (`vercel.json`), u istom regionu kao baza.
- Promjene šeme se šalju na produkcijsku bazu ručno: connection string bez poolera upiši u lokalni `.env.neon` (gitignore ga drži van gita), pa pokreni:

```bash
set -a && . ./.env.neon && set +a && npx prisma db push
```

## Prije produkcije

- **Mail:** SMTP podaci (npr. Resend, Postmark, Brevo) za reset šifre.
- **Google OAuth:** dodati produkcijsku domenu u redirect URI.
- **Chat:** trenutno radi preko pollinga. Za real-time bi trebali Pusher, Ably ili WebSocket.

## Plan

- [ ] Plaćanje i zaštita kupca
- [ ] Notifikacije (email/push) za nove poruke i lajkove
- [ ] Ponude („pošalji ponudu" ispod cijene)
- [ ] Praćenje prodavača i feed
- [ ] Prijava neprimjerenih oglasa i moderacija
