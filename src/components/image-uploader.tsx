"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Smanjuje sliku na max 1600px i pretvara u WEBP prije uploada */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compress"))), "image/webp", 0.85));
}

export function ImageUploader({ initial = [], error, onChange }: { initial?: string[]; error?: string; onChange?: (urls: string[]) => void }) {
  const [images, setImages] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | File[]) {
    const free = MAX_IMAGES - images.length - uploading;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length > free) toast.warning(`Možeš dodati najviše ${MAX_IMAGES} slika.`);
    const batch = list.slice(0, Math.max(0, free));
    setUploading((u) => u + batch.length);

    await Promise.all(
      batch.map(async (file) => {
        try {
          const body = new FormData();
          body.append("file", new File([await compress(file)], "image.webp", { type: "image/webp" }));
          const res = await fetch("/api/upload", { method: "POST", body });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setImages((prev) => [...prev, data.url]);
        } catch (e) {
          toast.error(e instanceof Error && e.message ? e.message : "Upload slike nije uspio.");
        } finally {
          setUploading((u) => u - 1);
        }
      }),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return next;
    });
  }

  const canAdd = images.length + uploading < MAX_IMAGES;
  const empty = images.length === 0 && uploading === 0;

  useEffect(() => {
    onChange?.(images);
  }, [images, onChange]);

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
  };

  return (
    <div>
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      {empty ? (
        <button
          type="button"
          {...dropProps}
          onClick={() => input.current?.click()}
          className={cn(
            "group flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 border border-dashed px-6 text-center transition-colors sm:aspect-[16/8]",
            dragOver ? "border-ink bg-subtle" : error ? "border-red-400" : "border-neutral-300 hover:border-ink hover:bg-subtle",
          )}
        >
          <span className="grid size-16 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:scale-105">
            <ImagePlus className="size-6 stroke-[1.5]" />
          </span>
          <span>
            <span className="block text-lg font-medium">Dodaj fotografije</span>
            <span className="mt-1 block text-sm text-muted">Prevuci ih ovdje ili klikni · JPG, PNG, WEBP · do {MAX_IMAGES} slika</span>
          </span>
        </button>
      ) : (
        <div {...dropProps} className={cn("grid grid-cols-3 gap-2 transition-colors sm:grid-cols-4", dragOver && "bg-subtle outline outline-1 outline-offset-4 outline-ink")}>
          <AnimatePresence>
            {images.map((url, i) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className={cn("group relative overflow-hidden bg-subtle", i === 0 ? "col-span-2 row-span-2" : "aspect-[3/4]")}
              >
                <img src={url} alt="" className="size-full object-cover" />
                {i === 0 && <span className="absolute bottom-3 left-3 bg-white px-2.5 py-1 text-[11px] font-medium">Naslovna</span>}
                <button type="button" onClick={() => setImages((p) => p.filter((u) => u !== url))} className="absolute top-2 right-2 grid size-8 place-items-center bg-white transition-colors hover:bg-ink hover:text-white" aria-label="Ukloni sliku">
                  <X className="size-4" />
                </button>
                <div className="absolute right-2 bottom-2 flex gap-1 transition sm:opacity-0 sm:group-hover:opacity-100">
                  {i > 0 && (
                    <button type="button" onClick={() => move(i, -1)} className="grid size-8 place-items-center bg-white transition-colors hover:bg-ink hover:text-white" aria-label="Pomjeri lijevo">
                      <ChevronLeft className="size-4" />
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => move(i, 1)} className="grid size-8 place-items-center bg-white transition-colors hover:bg-ink hover:text-white" aria-label="Pomjeri desno">
                      <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {Array.from({ length: uploading }, (_, i) => (
            <div key={`up-${i}`} className={cn("skeleton grid place-items-center", images.length === 0 && i === 0 ? "col-span-2 row-span-2" : "aspect-[3/4]")}>
              <Loader2 className="size-5 animate-spin text-muted" />
            </div>
          ))}
          {canAdd && (
            <button type="button" onClick={() => input.current?.click()} className="flex aspect-[3/4] flex-col items-center justify-center gap-2 border border-dashed border-neutral-300 text-muted transition-colors hover:border-ink hover:text-ink">
              <ImagePlus className="size-6 stroke-[1.5]" />
              <span className="text-xs tabular-nums">{images.length + uploading}/{MAX_IMAGES}</span>
            </button>
          )}
        </div>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files).then(() => (e.target.value = ""))} />
      <p className={cn("mt-3 text-[13px]", error ? "text-red-600" : "text-muted")}>{error ?? (empty ? "Savjet: prva slika je naslovna — neka bude cijeli artikal." : "Prva slika je naslovna. Strelicama mijenjaš redoslijed.")}</p>
    </div>
  );
}
