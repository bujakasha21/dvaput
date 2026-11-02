import type { ReactNode } from "react";

export const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-8 sm:py-20">
      <h1 className="animate-fade-up text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted">Posljednja izmjena: {updated}</p>
      <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-neutral-700 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

export function ContactLine() {
  return CONTACT ? (
    <>
      pišite na{" "}
      <a href={`mailto:${CONTACT}`} className="text-ink underline underline-offset-4">
        {CONTACT}
      </a>
    </>
  ) : (
    <>javite se kroz poruke u aplikaciji</>
  );
}
