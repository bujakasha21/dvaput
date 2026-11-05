"use client";

import { createPortal } from "react-dom";
import { motion, type Transition } from "motion/react";

/** Prelaz pri odjavi: prstenovi iz loga se razdvoje i ponovo spoje dok se sesija briše.
 * Portal iz istog razloga kao AuthTransition (transform roditelja ograniči fixed overlay). */
export function SignOutTransition({ name }: { name: string }) {
  const ring = "absolute top-0 size-10 rounded-full border-[6px] border-ink";
  const swing: Transition = { duration: 0.9, times: [0, 0.45, 1], ease: "easeInOut" };
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      aria-busy
      aria-live="polite"
    >
      <span className="relative h-10 w-16" aria-hidden>
        <motion.span className={`${ring} left-0`} animate={{ x: [0, -14, 0] }} transition={swing} />
        <motion.span className={`${ring} right-0`} animate={{ x: [0, 14, 0] }} transition={swing} />
      </span>
      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 text-sm text-muted">
        Vidimo se, {name.split(" ")[0]}
      </motion.p>
    </motion.div>,
    document.body,
  );
}

/** Koliko overlay ostaje prije preusmjeravanja */
export const SIGN_OUT_MS = 900;
