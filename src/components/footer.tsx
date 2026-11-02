import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 text-xs text-muted sm:flex-row sm:items-center sm:px-8">
        <Logo />
        <p>© {new Date().getFullYear()} Dvaput — nosi dvaput</p>
      </div>
    </footer>
  );
}
