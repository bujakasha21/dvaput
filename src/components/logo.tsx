import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Dvaput – početna">
      <span className="relative h-5 w-[32px]" aria-hidden>
        <span className="absolute top-0 left-0 size-5 rounded-full border-[3.5px] border-ink" />
        <span className="absolute top-0 right-0 size-5 rounded-full border-[3.5px] border-ink" />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.04em]">dvaput</span>
    </Link>
  );
}
