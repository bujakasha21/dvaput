// Demo podaci: npm run db:seed  (briše postojeće podatke!)
import { randomUUID } from "node:crypto";
import { PrismaClient, type Category, type Condition, type Gender } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();
const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
const DEMO_PASSWORD = "demo1234";

const users = [
  { name: "Ana Kovačević", email: "ana@demo.ba", city: "Sarajevo", bio: "Reseller vintage i streetwear komada. Šaljem BH poštom isti dan. ✨" },
  { name: "Marko Petrović", email: "marko@demo.ba", city: "Banja Luka", bio: "Patike i sportska odjeća, sve original." },
  { name: "Lejla Hodžić", email: "lejla@demo.ba", city: "Mostar", bio: "Čistim ormar 🙂" },
  { name: "Demo Korisnik", email: "demo@dvaput.ba", city: "Tuzla", bio: null },
];

type Seed = { title: string; description: string; price: number; category: Category; gender: Gender; condition: Condition; size?: string; brand?: string; color?: string; material?: string; images: string[]; seller: number; negotiable?: boolean };

const listings: Seed[] = [
  { title: "Bijela basic majica", description: "Klasična bijela majica, pamuk, nošena par puta. Bez fleka i oštećenja.", price: 12, category: "TOPS", gender: "UNISEX", condition: "VERY_GOOD", size: "M", brand: "COS", color: "Bijela", material: "100% pamuk", images: ["1521572163474-6864f9cf17ab", "1583743814966-8936f5b7be1a"], seller: 0 },
  { title: "Nike Air Max crvene", description: "Original Nike, nošene jednu sezonu. Đon u odličnom stanju, kutija nije sačuvana.", price: 95, category: "SNEAKERS", gender: "MEN", condition: "GOOD", size: "43", brand: "Nike", color: "Crvena", images: ["1542291026-7eec264c27ff", "1606107557195-0e29a4b5b4aa"], seller: 1, negotiable: true },
  { title: "Kožna jakna crna – vintage", description: "Prava koža, vintage komad iz 90-ih. Postava bez oštećenja, svi zatvarači rade.", price: 140, category: "JACKETS", gender: "WOMEN", condition: "VERY_GOOD", size: "S", brand: "Vintage", color: "Crna", material: "Koža", images: ["1551028719-00167b16eac5", "1591047139829-d91aecb6caea"], seller: 0, negotiable: true },
  { title: "Oversized hoodie siva", description: "Topla, mekana dukserica, oversized kroj. Nošena, bez pilinga.", price: 35, category: "SWEATERS", gender: "UNISEX", condition: "GOOD", size: "L", brand: "H&M", color: "Siva", images: ["1556821840-3a63f95609a7"], seller: 2 },
  { title: "Levi's 501 farmerke", description: "Klasične 501, straight kroj. W32 L32. Lijepo izblijedjele.", price: 55, category: "JEANS", gender: "MEN", condition: "VERY_GOOD", size: "32/32", brand: "Levi's", color: "Plava", material: "Denim", images: ["1542272604-787c3835535d", "1473966968600-fa801b869a1a"], seller: 0 },
  { title: "Ljetna haljina na cvjetiće", description: "Lagana haljina idealna za ljeto. Nošena jednom na vjenčanju.", price: 40, category: "DRESSES", gender: "WOMEN", condition: "NEW", size: "M", brand: "Mango", color: "Šarena", images: ["1595777457583-95e059d581b8", "1594633312681-425c7b97ccd1", "1539008835657-9e8e9680c956"], seller: 2 },
  { title: "Kožna torba braon", description: "Prostrana torba, stane laptop od 13''. Sitni tragovi korištenja na dnu.", price: 70, category: "BAGS", gender: "WOMEN", condition: "GOOD", brand: "Massimo Dutti", color: "Braon", material: "Koža", images: ["1584917865442-de89df76afd3", "1548036328-c9fa89d128fa"], seller: 0 },
  { title: "Bijele tenisice minimal", description: "Čiste bijele tenisice, idu uz sve. Nošene par puta, oprane.", price: 45, category: "SNEAKERS", gender: "UNISEX", condition: "VERY_GOOD", size: "40", color: "Bijela", images: ["1549298916-b41d501d3772", "1525507119028-ed4c629a60a3"], seller: 1 },
  { title: "Crna majica s printom", description: "Grafička majica, print bez pucanja. Veličina odgovara M.", price: 15, category: "TOPS", gender: "MEN", condition: "GOOD", size: "M", color: "Crna", images: ["1576566588028-4147f3842f27", "1618354691373-d851c5c3a990"], seller: 1 },
  { title: "Pleteni džemper krem", description: "Debeli pleteni džemper, jako topao. Kao nov.", price: 38, category: "SWEATERS", gender: "WOMEN", condition: "NEW_WITH_TAGS", size: "S", brand: "Zara", color: "Krem", material: "Vuna/akril", images: ["1620799140408-edc6dcb6d633", "1434389677669-e08b4cac3105"], seller: 2 },
  { title: "Kačket bež", description: "Podesiv kačket, univerzalna veličina.", price: 10, category: "ACCESSORIES", gender: "UNISEX", condition: "VERY_GOOD", size: "Univerzalna", color: "Bež", images: ["1588850561407-ed78c282e89b"], seller: 1 },
  { title: "Lanena košulja", description: "Prozračna lanena košulja, savršena za ljeto. Bez oštećenja.", price: 28, category: "SHIRTS", gender: "MEN", condition: "VERY_GOOD", size: "L", brand: "Uniqlo", color: "Bijela", material: "Lan", images: ["1624378439575-d8705ad7ae80"], seller: 3 },
  { title: "Mini suknja", description: "Slatka mini suknja, nošena par puta.", price: 18, category: "SKIRTS", gender: "WOMEN", condition: "GOOD", size: "XS", color: "Bež", images: ["1583496661160-fb5886a0aaaa"], seller: 2 },
  { title: "Zimski kaput camel", description: "Elegantan kaput, vuneni blend. Kemijski očišćen.", price: 120, category: "JACKETS", gender: "WOMEN", condition: "VERY_GOOD", size: "M", brand: "Massimo Dutti", color: "Camel", material: "Vuna", images: ["1544022613-e87ca75a784a"], seller: 0, negotiable: true },
  { title: "Sportski komplet", description: "Gornji dio i donji dio, za trening ili šetnju.", price: 30, category: "SPORTSWEAR", gender: "WOMEN", condition: "GOOD", size: "S", brand: "Adidas", images: ["1578587018452-892bacefd3f2", "1604176354204-9268737828e4"], seller: 3 },
  { title: "Patike za trčanje", description: "Lagane patike za trčanje, oko 200 km pređeno.", price: 50, category: "SNEAKERS", gender: "MEN", condition: "SATISFACTORY", size: "44", brand: "Nike", images: ["1560769629-975ec94e6a86"], seller: 1 },
  { title: "Teksas jakna", description: "Klasična teksas jakna, malo oversized.", price: 42, category: "JACKETS", gender: "UNISEX", condition: "VERY_GOOD", size: "M", brand: "Pull&Bear", color: "Plava", images: ["1596755094514-f87e34085b2c"], seller: 3 },
  { title: "Majica oversized bež", description: "Debeli pamuk, boxy kroj.", price: 14, category: "TOPS", gender: "UNISEX", condition: "NEW", size: "L", color: "Bež", images: ["1614252235316-8c857d38b5f4", "1612336307429-8a898d10e223"], seller: 0 },
];

const comments = ["Da li je dostupno još?", "Može li slika etikete?", "Koliko je dužina?", "Šaljete li u Zenicu?", "Može zamjena?", "Super komad! 😍"];
const reviewTexts = ["Brz dogovor, artikal kao na slikama. Preporuka!", "Sve super, poslano isti dan.", "Ljubazna komunikacija.", "Odlično upakovano 👌", "Malo kasnio odgovor, ali sve OK."];

async function main() {
  await prisma.$transaction([
    prisma.message.deleteMany(), prisma.conversation.deleteMany(), prisma.review.deleteMany(), prisma.comment.deleteMany(),
    prisma.like.deleteMany(), prisma.listingImage.deleteMany(), prisma.listing.deleteMany(),
    prisma.session.deleteMany(), prisma.account.deleteMany(), prisma.verification.deleteMany(), prisma.user.deleteMany(),
  ]);

  const password = await hashPassword(DEMO_PASSWORD);
  const created = [];
  for (const [i, u] of users.entries()) {
    const id = randomUUID();
    created.push(
      await prisma.user.create({
        data: {
          id, ...u, emailVerified: true,
          createdAt: new Date(Date.now() - (400 - i * 90) * 864e5),
          accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password } },
        },
      }),
    );
  }

  const made = [];
  for (const [i, l] of listings.entries()) {
    const { images, seller, ...data } = l;
    made.push(
      await prisma.listing.create({
        data: {
          ...data,
          city: created[seller].city,
          views: Math.floor(Math.random() * 300),
          createdAt: new Date(Date.now() - i * 5.5 * 36e5),
          sellerId: created[seller].id,
          images: { create: images.map((id, position) => ({ url: img(id), position })) },
        },
      }),
    );
  }

  // Lajkovi i komentari
  for (const [i, listing] of made.entries()) {
    for (const u of created) {
      if (u.id !== listing.sellerId && (i + u.email.length) % 3 === 0) await prisma.like.create({ data: { userId: u.id, listingId: listing.id } });
    }
    if (i % 3 === 0) {
      const author = created.find((u) => u.id !== listing.sellerId)!;
      await prisma.comment.create({ data: { listingId: listing.id, authorId: author.id, body: comments[i % comments.length] } });
    }
  }

  // Završene prodaje + razgovori + dojmovi
  const sales: [number, number][] = [[0, 2], [4, 3], [7, 0], [9, 3], [2, 1], [11, 0]];
  for (const [li, buyerIdx] of sales) {
    const listing = made[li];
    const buyer = created[buyerIdx];
    const convo = await prisma.conversation.create({ data: { listingId: listing.id, buyerId: buyer.id, sellerId: listing.sellerId } });
    const t = Date.now() - 3 * 864e5;
    await prisma.message.createMany({
      data: [
        { conversationId: convo.id, senderId: buyer.id, body: "Zdravo! Da li je još dostupno?", createdAt: new Date(t), readAt: new Date(t) },
        { conversationId: convo.id, senderId: listing.sellerId, body: "Jeste 🙂 Mogu poslati sutra.", createdAt: new Date(t + 6e5), readAt: new Date(t) },
        { conversationId: convo.id, senderId: buyer.id, body: "Super, uzimam!", createdAt: new Date(t + 12e5), readAt: new Date(t) },
      ],
    });
    await prisma.listing.update({ where: { id: listing.id }, data: { status: "SOLD", buyerId: buyer.id, soldAt: new Date(t + 864e5) } });
    await prisma.review.create({ data: { authorId: buyer.id, targetId: listing.sellerId, listingId: listing.id, rating: li % 4 === 3 ? 4 : 5, body: reviewTexts[li % reviewTexts.length] } });
  }

  // Aktivan razgovor s nepročitanom porukom za demo korisnika
  const demo = created[3];
  const target = made[1];
  const convo = await prisma.conversation.create({ data: { listingId: target.id, buyerId: demo.id, sellerId: target.sellerId } });
  await prisma.message.createMany({
    data: [
      { conversationId: convo.id, senderId: demo.id, body: "Pozdrav, može li 85 KM?", createdAt: new Date(Date.now() - 36e5), readAt: new Date() },
      { conversationId: convo.id, senderId: target.sellerId, body: "Može 90 i šaljem gratis 🙂", createdAt: new Date(Date.now() - 18e5) },
    ],
  });
  await prisma.listing.update({ where: { id: made[5].id }, data: { status: "RESERVED" } });

  console.log(`✅ Seed gotov: ${created.length} korisnika, ${made.length} oglasa. Šifra za sve demo račune: ${DEMO_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
