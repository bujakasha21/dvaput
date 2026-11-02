"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: images.length > 1 });
  const [thumbsRef, thumbs] = useEmblaCarousel({ dragFree: true, containScroll: "keepSnaps" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    const index = embla.selectedScrollSnap();
    setSelected(index);
    thumbs?.scrollTo(index);
  }, [embla, thumbs]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") embla?.scrollPrev();
      if (e.key === "ArrowRight") embla?.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embla]);

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-lg bg-subtle">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {images.map((src, i) => (
              <div key={src + i} className="aspect-[3/4] min-w-0 flex-[0_0_100%]">
                <img src={src} alt={`${alt} – slika ${i + 1}`} className="size-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={() => embla?.scrollPrev()}
              aria-label="Prethodna slika"
              className="absolute top-1/2 left-3 grid size-9 -translate-y-1/2 place-items-center rounded-none bg-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => embla?.scrollNext()}
              aria-label="Sljedeća slika"
              className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-none bg-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span key={i} className={cn("h-[3px] rounded-full bg-white transition-all", i === selected ? "w-5" : "w-[3px] opacity-60")} />
              ))}
            </div>
            <span className="absolute top-3 left-3 rounded-none bg-white px-2 py-0.5 text-[11px] font-medium tabular-nums">
              {selected + 1}/{images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div ref={thumbsRef} className="overflow-hidden">
          <div className="flex gap-2 p-1">
            {images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => embla?.scrollTo(i)}
                className={cn(
                  "aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md transition-opacity",
                  i === selected ? "opacity-100 ring-1 ring-ink ring-offset-2" : "opacity-50 hover:opacity-100",
                )}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
