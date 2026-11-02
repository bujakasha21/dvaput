"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ListingStatus } from "@prisma/client";
import { deleteListing, setListingStatus } from "@/app/actions/listings";
import { Button, Select } from "@/components/ui";

type Props = { listingId: string; status: ListingStatus; buyers: { id: string; name: string }[]; compact?: boolean; afterDelete?: string };

export function OwnerActions({ listingId, status, buyers, compact, afterDelete = "/moj-ormar" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selling, setSelling] = useState(false);
  const [buyerId, setBuyerId] = useState("");

  const run = (fn: () => Promise<void>, msg: string) =>
    startTransition(async () => {
      await fn();
      toast.success(msg);
      router.refresh();
    });

  const size = compact ? "sm" : "md";

  return (
    <>
      {status !== "SOLD" ? (
        <>
          <Button size={size} variant="primary" loading={pending && selling} onClick={() => setSelling(true)}>
            Označi prodano
          </Button>
          <Button
            size={size}
            variant="outline"
            disabled={pending}
            onClick={() => run(() => setListingStatus(listingId, status === "RESERVED" ? "ACTIVE" : "RESERVED"), status === "RESERVED" ? "Oglas je ponovo aktivan" : "Oglas je rezervisan")}
          >
            {status === "RESERVED" ? "Ukloni rezervaciju" : "Rezerviši"}
          </Button>
        </>
      ) : (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run(() => setListingStatus(listingId, "ACTIVE"), "Oglas je ponovo aktivan")}>
          Vrati u aktivne
        </Button>
      )}
      <Button
        size={size}
        variant="danger"
        disabled={pending}
        onClick={() => {
          if (!confirm("Sigurno želiš obrisati oglas? Ovo se ne može vratiti.")) return;
          startTransition(async () => {
            await deleteListing(listingId);
            toast.success("Oglas obrisan");
            router.push(afterDelete);
            router.refresh();
          });
        }}
      >
        {compact ? <Trash2 className="size-4" /> : "Obriši"}
      </Button>

      <AnimatePresence>
        {selling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={() => setSelling(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-6">
              <h3 className="text-lg font-semibold tracking-tight">Kome si prodao/la?</h3>
              <p className="mt-1 text-sm text-muted">Izaberi kupca da biste mogli razmijeniti dojmove.</p>
              <Select className="mt-4" value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
                <option value="">Prodano van aplikacije</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSelling(false)}>Odustani</Button>
                <Button
                  variant="primary"
                  loading={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await setListingStatus(listingId, "SOLD", buyerId || null);
                      setSelling(false);
                      toast.success("Označeno kao prodano");
                      router.refresh();
                    })
                  }
                >
                  Potvrdi
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
