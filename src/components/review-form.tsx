"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { addReview } from "@/app/actions/social";
import { cn } from "@/lib/utils";
import { Button, Textarea } from "./ui";

const LABELS = ["", "Loše", "Može bolje", "Okej", "Vrlo dobro", "Odlično!"];

export function ReviewForm({ targetId, targetName, listingId }: { targetId: string; targetName: string; listingId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Ostavi dojam</Button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-6">
              <h3 className="text-lg font-semibold tracking-tight">Kakav je bio dogovor s {targetName.split(" ")[0]}?</h3>
              <p className="mt-1 text-sm text-muted">Tvoj dojam pomaže drugima da znaju koliko je osoba pouzdana.</p>
              <div className="mt-5 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} className="transition hover:scale-110 active:scale-95" aria-label={`${i} zvjezdica`}>
                    <Star className={cn("size-7 stroke-[1.5]", i <= (hover || rating) ? "fill-ink text-ink" : "text-neutral-300")} />
                  </button>
                ))}
                <span className="ml-3 text-sm text-muted">{LABELS[hover || rating]}</span>
              </div>
              <Textarea className="mt-4" value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} placeholder="Brz dogovor, artikal kao na slikama… (opcionalno)" />
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Odustani</Button>
                <Button
                  variant="primary"
                  loading={pending}
                  disabled={!rating}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await addReview(targetId, listingId, { rating, body });
                      if (res.error) return void toast.error(res.error);
                      toast.success("Hvala na dojmu");
                      setOpen(false);
                    })
                  }
                >
                  Pošalji dojam
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
