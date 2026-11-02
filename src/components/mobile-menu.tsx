"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { COLLECTIONS, FEATURED_SLUGS, collectionHref, getCollection } from "@/lib/collections";
import { SearchBar } from "./search-bar";

const MAIN = [...FEATURED_SLUGS, "torbe"];
const MORE = COLLECTIONS.filter((c) => c.category && !MAIN.includes(c.slug));

export function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="-ml-2 grid size-9 place-items-center lg:hidden" aria-label="Otvori meni">
        <Menu className="size-5 stroke-[1.5]" />
      </button>

      {/* Portal: backdrop-blur na headeru bi inače ograničio fixed overlay na visinu navbara */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white lg:hidden"
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
                  <span className="text-[11px] tracking-[0.2em] text-muted uppercase">Meni</span>
                  <button onClick={close} className="-mr-2 grid size-9 place-items-center" aria-label="Zatvori meni">
                    <X className="size-5 stroke-[1.5]" />
                  </button>
                </div>

                <div className="px-4 pt-5" onSubmitCapture={close}>
                  <SearchBar />
                </div>

                <nav className="px-4 pt-6">
                  {MAIN.map((slug, i) => (
                    <motion.div key={slug} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i + 0.05 }}>
                      <Link href={collectionHref(slug)} onClick={close} className="group flex items-center justify-between border-b border-line py-4 text-[1.7rem] font-medium tracking-[-0.03em]">
                        {getCollection(slug)!.title}
                        <ArrowRight className="size-5 stroke-[1.5] text-muted transition-transform group-active:translate-x-1" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="px-4 pt-8">
                  <p className="mb-3 text-[11px] tracking-[0.2em] text-muted uppercase">Još kategorija</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                    {MORE.map((c) => (
                      <Link key={c.slug} href={collectionHref(c.slug)} onClick={close} className="text-neutral-600">
                        {c.title}
                      </Link>
                    ))}
                    <Link href={collectionHref("sve")} onClick={close} className="font-medium">
                      Svi artikli →
                    </Link>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 p-4 pt-10">
                  {loggedIn ? (
                    <>
                      <Link href="/moj-ormar" onClick={close} className="flex h-12 items-center justify-center border border-line text-sm font-medium">
                        Moj ormar
                      </Link>
                      <Link href="/oglasi/novi" onClick={close} className="flex h-12 items-center justify-center bg-ink text-sm font-medium text-white">
                        Prodaj
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/prijava" onClick={close} className="flex h-12 items-center justify-center border border-line text-sm font-medium">
                        Prijava
                      </Link>
                      <Link href="/registracija" onClick={close} className="flex h-12 items-center justify-center bg-ink text-sm font-medium text-white">
                        Registracija
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
