import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trust } from "@/lib/queries";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} od 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={cn(i <= Math.round(value) ? "fill-ink text-ink" : "fill-neutral-200 text-neutral-200")} />
      ))}
    </span>
  );
}

/** Diskretna oznaka pouzdanosti; "Oprez" je jedina u boji jer je upozorenje */
export function TrustBadge({ trust }: { trust: Trust }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-none border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap", trust.level === "ok" ? "border-amber-200 text-amber-700" : trust.level === "top" ? "border-ink bg-ink text-white" : "border-line text-muted")}>
      {trust.label}
    </span>
  );
}

/** Pouzdanost kao procenat (prosjek / 5) */
export function TrustMeter({ trust }: { trust: Trust }) {
  const pct = trust.count ? Math.round((trust.average / 5) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-muted">Pouzdanost</span>
        <span className="font-medium">{trust.count ? `${pct}%` : "—"}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
