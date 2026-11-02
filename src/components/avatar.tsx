import { cn, initials } from "@/lib/utils";

const COLORS = ["bg-neutral-200 text-neutral-700", "bg-stone-200 text-stone-700", "bg-zinc-200 text-zinc-700"];

export function Avatar({ name, image, size = 40, className }: { name: string; image?: string | null; size?: number; className?: string }) {
  const color = COLORS[name.length % COLORS.length];
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-medium", color, className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {image ? <img src={image} alt={name} className="size-full object-cover" referrerPolicy="no-referrer" /> : initials(name)}
    </span>
  );
}
