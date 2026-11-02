"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const img = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const SLIDES = [
  {
    image: img("1558769132-cb1aea458c5e"),
    eyebrow: "Nova sezona",
    title: "Jesenski ormar\nza pola cijene",
    cta: "Jakne i džemperi",
    href: "/kategorije/jakne",
  },
  {
    image: img("1515886657613-9f3515b0c78f"),
    eyebrow: "Streetwear",
    title: "Komadi s karakterom\nod 10 KM",
    cta: "Sportska odjeća",
    href: "/kategorije/sportska-odjeca",
  },
  {
    image: img("1490481651871-ab68de25d43d"),
    eyebrow: "Prodaj",
    title: "Ono što ne nosiš,\nneko traži",
    cta: "Objavi artikal",
    href: "/oglasi/novi",
  },
];

const TILES = [
  { image: img("1483985988355-763728e1935b", 900), title: "Žene", href: "/kategorije/zene" },
  { image: img("1479064555552-3ef4979f8908", 900), title: "Muškarci", href: "/kategorije/muskarci" },
];

const AUTOPLAY_MS = 6000;

export function HomeBanner() {
  const [ref, embla] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const onSelect = useCallback(() => embla && setSelected(embla.selectedScrollSnap()), [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  useEffect(() => {
    if (!embla || paused) return;
    const t = setInterval(() => embla.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [embla, paused, selected]);

  return (
    <div className="grid gap-2 lg:grid-cols-[2.2fr_1fr]">
      <div className="relative overflow-hidden rounded-lg bg-subtle" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div ref={ref} className="overflow-hidden">
          <div className="flex">
            {SLIDES.map((s, i) => (
              <Link key={s.title} href={s.href} className="group relative block aspect-[4/5] min-w-0 flex-[0_0_100%] sm:aspect-[16/10] lg:aspect-auto lg:h-[min(72vh,680px)]">
                <img
                  src={s.image}
                  alt=""
                  className={cn("absolute inset-0 size-full object-cover transition-transform duration-[6000ms] ease-out", selected === i ? "scale-[1.04]" : "scale-100")}
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/25 to-transparent" />
                <div className={cn("absolute inset-x-0 bottom-0 p-6 text-white transition-all delay-150 duration-700 sm:p-12", selected === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
                  <p className="text-[11px] tracking-[0.25em] uppercase opacity-75">{s.eyebrow}</p>
                  <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.05] font-medium tracking-[-0.03em] whitespace-pre-line sm:text-6xl">{s.title}</h2>
                  <span className="mt-6 inline-flex items-center gap-2 border-b border-white/60 pb-1 text-sm transition-all group-hover:gap-3 group-hover:border-white">
                    {s.cta} <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-6 top-6 flex items-center gap-4 text-[11px] text-white/80 tabular-nums sm:inset-x-12 sm:top-10">
          <span>{String(selected + 1).padStart(2, "0")}</span>
          <div className="pointer-events-auto flex flex-1 gap-1.5">
            {SLIDES.map((s, i) => (
              <button key={s.title} onClick={() => embla?.scrollTo(i)} aria-label={`Slajd ${i + 1}`} className="relative h-px flex-1 overflow-hidden bg-white/30 py-0">
                {i < selected && <span className="absolute inset-0 bg-white" />}
                {i === selected && (
                  <span key={`${i}-${paused}`} className="absolute inset-y-0 left-0 bg-white" style={{ animation: paused ? "none" : `banner-progress ${AUTOPLAY_MS}ms linear forwards`, width: paused ? "100%" : undefined }} />
                )}
              </button>
            ))}
          </div>
          <span>{String(SLIDES.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {TILES.map((t) => (
          <Link key={t.title} href={t.href} className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-subtle lg:aspect-auto">
            <img src={t.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-7">
              <span className="text-lg font-medium tracking-tight sm:text-2xl">{t.title}</span>
              <span className="flex items-center gap-1.5 text-xs opacity-80 transition-all group-hover:gap-2.5 group-hover:opacity-100">
                <span className="hidden sm:inline">Pogledaj</span> <ArrowRight className="size-3.5 sm:size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
