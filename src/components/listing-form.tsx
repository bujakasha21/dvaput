"use client";

import { startTransition, useActionState, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Listing } from "@prisma/client";
import { saveListing } from "@/app/actions/listings";
import { CATEGORY_LABELS, CONDITION_HINTS, CONDITION_LABELS, GENDER_LABELS, SHOE_SIZES, SIZES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { ImageUploader } from "./image-uploader";
import { Button, Input, Textarea } from "./ui";

type Props = { listing?: Listing & { images: { url: string }[] }; defaultCity?: string | null };

const big = "h-13 px-4 text-base";

export function ListingForm({ listing, defaultCity }: Props) {
  const [state, action, pending] = useActionState(saveListing.bind(null, listing?.id ?? null), undefined);
  const [images, setImages] = useState<string[]>(listing?.images.map((i) => i.url) ?? []);
  const [draft, setDraft] = useState({
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    price: listing?.price ? String(listing.price) : "",
    category: listing?.category ?? "",
    gender: listing?.gender ?? "WOMEN",
    condition: listing?.condition ?? "",
    size: listing?.size ?? "",
    brand: listing?.brand ?? "",
    color: listing?.color ?? "",
    material: listing?.material ?? "",
    city: listing?.city ?? defaultCity ?? "",
  });
  const set = (key: keyof typeof draft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const bind = (key: keyof typeof draft) => ({ name: key, value: draft[key], onChange: (ev: { target: { value: string } }) => set(key)(ev.target.value) });

  const e = state?.errors ?? {};
  const shoe = draft.category === "SHOES" || draft.category === "SNEAKERS";

  const steps = [
    { label: "Slike", done: images.length > 0 },
    { label: "Naslov", done: draft.title.trim().length >= 3 },
    { label: "Opis", done: draft.description.trim().length >= 10 },
    { label: "Kategorija", done: !!draft.category },
    { label: "Stanje", done: !!draft.condition },
    { label: "Cijena", done: Number(draft.price) > 0 },
  ];
  const progress = steps.filter((s) => s.done).length / steps.length;
  const submitLabel = listing ? "Sačuvaj izmjene" : "Objavi oglas";

  return (
    // Ručni submit, da React ne resetuje formu kad server vrati greške
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16"
    >
      <div>
        <Section n="01" title="Fotografije" text="Do 5 slika. Dnevno svjetlo i neutralna pozadina prodaju najbolje.">
          <ImageUploader initial={listing?.images.map((i) => i.url)} error={e.images} onChange={setImages} />
        </Section>

        <Section n="02" title="O artiklu" text="Kratak, jasan naslov i iskren opis.">
          <div className="space-y-6">
            <BigField label="Naslov" error={e.title} counter={`${draft.title.length}/80`}>
              <Input {...bind("title")} maxLength={80} required aria-invalid={!!e.title} placeholder="npr. Nike Air Max 90, bijele" className={cn(big, "text-lg")} />
            </BigField>
            <BigField label="Opis" error={e.description} counter={`${draft.description.length}/2000`}>
              <Textarea {...bind("description")} maxLength={2000} required aria-invalid={!!e.description} rows={6} placeholder="Stanje, mjere, koliko je nošeno, eventualna oštećenja…" className="px-4 py-3.5 text-base leading-relaxed" />
            </BigField>
          </div>
        </Section>

        <Section n="03" title="Kategorija" text="Gdje bi ga kupci tražili?">
          <input type="hidden" name="category" value={draft.category} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <Tile key={k} active={draft.category === k} onClick={() => set("category")(k)}>
                {v}
              </Tile>
            ))}
          </div>
          {e.category && <FieldError>{e.category}</FieldError>}

          <p className="mt-9 mb-3 text-sm font-medium">Za koga</p>
          <input type="hidden" name="gender" value={draft.gender} />
          <div className="grid grid-cols-4 border border-line">
            {Object.entries(GENDER_LABELS).map(([k, v]) => (
              <button key={k} type="button" onClick={() => set("gender")(k)} className={cn("relative h-12 border-l border-line text-sm transition-colors first:border-l-0", draft.gender === k ? "text-white" : "hover:bg-subtle")}>
                {draft.gender === k && <motion.span layoutId="gender" className="absolute inset-0 bg-ink" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section n="04" title="Stanje" text="Budi iskren — to gradi povjerenje i dobre dojmove.">
          <input type="hidden" name="condition" value={draft.condition} />
          <div className="divide-y divide-line border border-line">
            {Object.entries(CONDITION_LABELS).map(([k, v], i, all) => {
              const active = draft.condition === k;
              return (
                <button key={k} type="button" onClick={() => set("condition")(k)} className={cn("flex w-full items-center gap-5 px-5 py-4 text-left transition-colors", active ? "bg-ink text-white" : "hover:bg-subtle")}>
                  <span className="flex shrink-0 gap-1" aria-hidden>
                    {all.map((_, j) => (
                      <span key={j} className={cn("h-4 w-1", j < all.length - i ? (active ? "bg-white" : "bg-ink") : active ? "bg-white/25" : "bg-line")} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{v}</span>
                    <span className={cn("block text-[13px]", active ? "text-white/60" : "text-muted")}>{CONDITION_HINTS[k as keyof typeof CONDITION_HINTS]}</span>
                  </span>
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", active ? "border-white bg-white text-ink" : "border-line")}>{active && <Check className="size-3" strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
          {e.condition && <FieldError>{e.condition}</FieldError>}
        </Section>

        <Section n="05" title="Detalji" text="Sve je opcionalno, ali pomaže kod pretrage.">
          <div className="space-y-6">
            <div>
              <BigField label="Veličina" error={e.size}>
                <Input {...bind("size")} placeholder={shoe ? "42" : "M"} maxLength={20} className={big} />
              </BigField>
              <div className="no-scrollbar -mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {(shoe ? SHOE_SIZES : SIZES).map((s) => (
                  <button key={s} type="button" onClick={() => set("size")(s)} className={cn("h-9 min-w-11 shrink-0 border px-3 text-[13px] tabular-nums transition-colors", draft.size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <BigField label="Brend" error={e.brand}>
                <Input {...bind("brand")} placeholder="Zara, Nike…" maxLength={40} className={big} />
              </BigField>
              <BigField label="Boja">
                <Input {...bind("color")} placeholder="Crna" maxLength={30} className={big} />
              </BigField>
              <BigField label="Materijal">
                <Input {...bind("material")} placeholder="100% pamuk" maxLength={40} className={big} />
              </BigField>
              <BigField label="Grad">
                <Input {...bind("city")} placeholder="Sarajevo" maxLength={40} className={big} />
              </BigField>
            </div>
          </div>
        </Section>

        <Section n="06" title="Cijena" text="Pogledaj slične oglase da odrediš fer cijenu.">
          <label className={cn("flex items-baseline border-b-2 pb-2 transition-colors focus-within:border-ink", e.price ? "border-red-500" : "border-line")}>
            <input
              {...bind("price")}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              aria-invalid={!!e.price}
              placeholder="0"
              className="w-full min-w-0 bg-transparent text-5xl font-semibold tracking-tight tabular-nums outline-none placeholder:text-neutral-300 [appearance:textfield] sm:text-6xl [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-2xl font-medium text-muted">KM</span>
          </label>
          {e.price && <FieldError>{e.price}</FieldError>}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Toggle name="negotiable" label="Cijena po dogovoru" text="Kupci mogu ponuditi manje" defaultChecked={listing?.negotiable ?? false} />
            <Toggle name="shipping" label="Moguća dostava" text="Šalješ brzom poštom" defaultChecked={listing?.shipping ?? true} />
          </div>
        </Section>

        {state?.message && <p className="animate-fade-up mt-6 text-sm text-red-600">{state.message}</p>}
      </div>

      {/* Desktop: pregled oglasa i napredak */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-6 border-t border-line pt-6">
          <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Pregled oglasa</p>
          <Preview image={images[0]} count={images.length} title={draft.title} price={draft.price} meta={[draft.size, draft.brand].filter(Boolean).join(" · ")} condition={draft.condition} />
          <div>
            <div className="mb-3 flex items-baseline justify-between text-sm">
              <span className="font-medium">Spremno</span>
              <span className="text-muted tabular-nums">{Math.round(progress * 100)}%</span>
            </div>
            <Bar progress={progress} />
            <ul className="mt-4 grid grid-cols-2 gap-y-2 text-[13px]">
              {steps.map((s) => (
                <li key={s.label} className={cn("flex items-center gap-2 transition-colors", s.done ? "text-ink" : "text-muted")}>
                  <span className={cn("grid size-4 place-items-center rounded-full border transition-colors", s.done ? "border-ink bg-ink text-white" : "border-line")}>{s.done && <Check className="size-2.5" strokeWidth={3} />}</span>
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
          <Button type="submit" size="lg" loading={pending} className="h-14 w-full text-[15px]">
            {submitLabel}
          </Button>
        </div>
      </aside>

      {/* Mobile: donja traka */}
      <div className="sticky bottom-0 z-10 -mx-4 -mt-6 border-t border-line bg-white/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur lg:hidden">
        <Bar progress={progress} />
        <div className="mt-3 flex items-center gap-4">
          <p className="flex-1 text-[13px] text-muted">
            {steps.filter((s) => s.done).length} od {steps.length} koraka{draft.price && <span className="ml-1 font-medium text-ink">· {formatPrice(Number(draft.price))}</span>}
          </p>
          <Button type="submit" size="lg" loading={pending}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({ n, title, text, children }: { n: string; title: string; text?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10 first:border-t-0 first:pt-0 sm:py-12">
      <div className="mb-7 flex gap-5">
        <span className="pt-1 text-xs font-medium text-muted tabular-nums">{n}</span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {text && <p className="mt-1 text-sm text-muted">{text}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function BigField({ label, error, counter, children }: { label: string; error?: string; counter?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between text-sm font-medium">
        {label}
        {counter && <span className="text-xs font-normal text-muted tabular-nums">{counter}</span>}
      </span>
      {children}
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

function Tile({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex h-14 items-center justify-between gap-2 border px-4 text-left text-sm transition-colors", active ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
      <span className="truncate">{children}</span>
      {active && <Check className="size-4 shrink-0" />}
    </button>
  );
}

function Toggle({ name, label, text, defaultChecked }: { name: string; label: string; text: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 border border-line px-4 py-3.5 transition-colors select-none has-checked:border-ink">
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-ink after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

function Preview({ image, count, title, price, meta, condition }: { image?: string; count: number; title: string; price: string; meta: string; condition: string }) {
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-subtle">
        {image ? (
          <motion.img key={image} src={image} alt="" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="size-full object-cover" />
        ) : (
          <div className="skeleton size-full" />
        )}
        {count > 1 && <span className="absolute top-3 right-3 bg-white px-2 py-0.5 text-[11px] font-medium tabular-nums">1/{count}</span>}
        {condition && <span className="absolute bottom-3 left-3 bg-white px-2.5 py-1 text-[11px] font-medium">{CONDITION_LABELS[condition as keyof typeof CONDITION_LABELS]}</span>}
      </div>
      <div className="mt-3 space-y-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[13px] text-muted">{meta || "Veličina · Brend"}</p>
          <p className="shrink-0 text-sm font-medium">{Number(price) > 0 ? formatPrice(Number(price)) : "— KM"}</p>
        </div>
        <p className={cn("truncate text-sm", !title && "text-muted")}>{title || "Naslov oglasa"}</p>
      </div>
    </div>
  );
}

function Bar({ progress }: { progress: number }) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-line">
      <motion.div className="h-full rounded-full bg-ink" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", bounce: 0, duration: 0.6 }} />
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs text-red-600">{children}</p>;
}
