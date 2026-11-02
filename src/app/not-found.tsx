import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Ovaj komad je nestao</h1>
      <p className="mt-2 text-muted">Stranica ili oglas ne postoji — možda je već prodan.</p>
      <Link href="/" className="mt-6 rounded-none bg-ink px-5 py-2.5 text-sm font-medium text-white">Nazad na oglase</Link>
    </div>
  );
}
