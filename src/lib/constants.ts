import type { Category, Condition, Gender, ListingStatus } from "@prisma/client";

export const CATEGORY_LABELS: Record<Category, string> = {
  TOPS: "Majice",
  SHIRTS: "Košulje",
  SWEATERS: "Džemperi i duksevi",
  JACKETS: "Jakne i kaputi",
  PANTS: "Pantalone",
  JEANS: "Farmerke",
  DRESSES: "Haljine",
  SKIRTS: "Suknje",
  SHOES: "Obuća",
  SNEAKERS: "Patike",
  BAGS: "Torbe",
  ACCESSORIES: "Dodaci",
  SPORTSWEAR: "Sportska odjeća",
  OTHER: "Ostalo",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  NEW_WITH_TAGS: "Novo s etiketom",
  NEW: "Novo bez etikete",
  VERY_GOOD: "Vrlo dobro",
  GOOD: "Dobro",
  SATISFACTORY: "Zadovoljavajuće",
};

export const CONDITION_HINTS: Record<Condition, string> = {
  NEW_WITH_TAGS: "Nikad nošeno, etiketa još na artiklu",
  NEW: "Nikad nošeno, bez etikete",
  VERY_GOOD: "Nošeno par puta, bez vidljivih tragova",
  GOOD: "Nošeno, sitni tragovi korištenja",
  SATISFACTORY: "Vidljivi tragovi, opisano u oglasu",
};

export const GENDER_LABELS: Record<Gender, string> = {
  WOMEN: "Žene",
  MEN: "Muškarci",
  KIDS: "Djeca",
  UNISEX: "Unisex",
};

export const STATUS_LABELS: Record<ListingStatus, string> = {
  ACTIVE: "Aktivan",
  RESERVED: "Rezervisan",
  SOLD: "Prodano",
};

export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "Univerzalna"];
export const SHOE_SIZES = Array.from({ length: 16 }, (_, i) => String(34 + i));

export const MAX_IMAGES = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
