import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 text-xs text-muted sm:flex-row sm:items-center sm:px-8">
        <Logo />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/uslovi" className="transition-colors hover:text-ink">Uslovi korištenja</Link>
          <Link href="/privatnost" className="transition-colors hover:text-ink">Privatnost</Link>
          <p>© {new Date().getFullYear()} Dvaput — nosi dvaput</p>
        </div>
      </div>
    </footer>
  );
}
