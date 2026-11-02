import type { Category, Gender, Prisma } from "@prisma/client";
import { CATEGORY_LABELS } from "./constants";

/** Stranica kategorije (/kategorije/[slug]): spol, vrsta artikla ili sve */
export type Collection = {
  slug: string;
  title: string;
  description: string;
  gender?: Gender;
  category?: Category;
};

const GENDER_COLLECTIONS: Collection[] = [
  { slug: "zene", title: "Žene", description: "Haljine, jakne, torbe i sve između.", gender: "WOMEN" },
  { slug: "muskarci", title: "Muškarci", description: "Od basic majica do vintage jakni.", gender: "MEN" },
  { slug: "djeca", title: "Djeca", description: "Brzo prerastu — zato polovno ima smisla.", gender: "KIDS" },
];

const CATEGORY_SLUGS: Record<Category, string> = {
  TOPS: "majice",
  SHIRTS: "kosulje",
  SWEATERS: "dzemperi",
  JACKETS: "jakne",
  PANTS: "pantalone",
  JEANS: "farmerke",
  DRESSES: "haljine",
  SKIRTS: "suknje",
  SHOES: "obuca",
  SNEAKERS: "patike",
  BAGS: "torbe",
  ACCESSORIES: "dodaci",
  SPORTSWEAR: "sportska-odjeca",
  OTHER: "ostalo",
};

const CATEGORY_COLLECTIONS: Collection[] = (Object.keys(CATEGORY_SLUGS) as Category[]).map((category) => ({
  slug: CATEGORY_SLUGS[category],
  title: CATEGORY_LABELS[category],
  description: `Polovni artikli u kategoriji ${CATEGORY_LABELS[category].toLowerCase()}.`,
  category,
}));

export const ALL_COLLECTION: Collection = { slug: "sve", title: "Svi artikli", description: "Sve što je trenutno u ponudi." };

export const COLLECTIONS = [ALL_COLLECTION, ...GENDER_COLLECTIONS, ...CATEGORY_COLLECTIONS];

/** Kategorije koje se prikazuju kao redovi na početnoj i u navigaciji */
export const FEATURED_SLUGS = ["zene", "muskarci", "djeca", "patike", "jakne"];

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function collectionHref(slug: string) {
  return `/kategorije/${slug}`;
}

export function categoryHref(category: Category) {
  return collectionHref(CATEGORY_SLUGS[category]);
}

export function collectionWhere(c: Collection): Prisma.ListingWhereInput {
  return { ...(c.gender && { gender: c.gender }), ...(c.category && { category: c.category }) };
}
