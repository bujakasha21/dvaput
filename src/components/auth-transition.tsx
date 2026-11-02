"use client";

import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ListingCardSkeleton } from "./listing-card";

/** Prelaz nakon prijave: skeleton dashboarda dok se učitava korisnički prostor.
 * Ide kroz portal jer animirani roditelj (transform) inače ograniči fixed overlay. */
export function AuthTransition({ name }: { name?: string }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 overflow-hidden bg-white"
      aria-busy
      aria-live="polite"
    >
      <div className="h-14 border-b border-line" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 text-sm text-muted">
          {name ? `Dobro došli, ${name.split(" ")[0]}` : "Pripremamo tvoj ormar"}
          <span className="inline-flex w-5">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>
                .
              </motion.span>
            ))}
          </span>
        </motion.p>

        <div className="flex items-center gap-4">
          <div className="skeleton size-14 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-3.5 w-28" />
          </div>
        </div>
        <div className="mt-12 flex gap-6 border-b border-line pb-3">
          {[64, 80, 72, 64].map((w, i) => (
            <div key={i} className="skeleton h-4" style={{ width: w }} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <ListingCardSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

/** Minimalno trajanje prelaza da animacija ne bljesne; ruta se u međuvremenu prefetchuje */
export const TRANSITION_MS = 800;
