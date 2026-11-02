"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { CATEGORY_LABELS, CONDITION_LABELS, GENDER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 shrink-0 [field-sizing:content] cursor-pointer appearance-none rounded-none bg-subtle pr-7 pl-3.5 text-[13px] outline-none transition-colors hover:bg-neutral-200/70 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230a0a0a%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat";

export function Filters({ hideCategories, hideGender }: { hideCategories?: boolean; hideGender?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  const category = params.get("category");
  const active = ["gender", "condition", "sort", "min", "max", "q"].some((k) => params.get(k));
  const categories: [string | null, string][] = [[null, "Sve"], ...Object.entries(CATEGORY_LABELS)];

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      {!hideCategories && (
        <div className="no-scrollbar mb-4 hidden gap-6 overflow-x-auto border-b border-line sm:flex">
          {categories.map(([key, label]) => {
            const isActive = category === key;
            return (
              <button key={label} onClick={() => set("category", key)} className={cn("relative shrink-0 pb-3 text-sm whitespace-nowrap transition-colors", isActive ? "text-ink" : "text-muted hover:text-ink")}>
                {label}
                {isActive && <motion.span layoutId="cat-underline" className="absolute inset-x-0 -bottom-px h-px bg-ink" transition={{ type: "spring", bounce: 0, duration: 0.35 }} />}
              </button>
            );
          })}
        </div>
      )}

      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {!hideCategories && (
          <select aria-label="Vrsta" className={`${selectClass} sm:hidden`} value={category ?? ""} onChange={(e) => set("category", e.target.value || null)}>
            {categories.map(([key, label]) => (
              <option key={label} value={key ?? ""}>{key ? label : "Sve vrste"}</option>
            ))}
          </select>
        )}
        {!hideGender && (
          <select aria-label="Za koga" className={selectClass} value={params.get("gender") ?? ""} onChange={(e) => set("gender", e.target.value || null)}>
            <option value="">Za sve</option>
            {Object.entries(GENDER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        )}
        <select aria-label="Stanje" className={selectClass} value={params.get("condition") ?? ""} onChange={(e) => set("condition", e.target.value || null)}>
          <option value="">Stanje</option>
          {Object.entries(CONDITION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex h-8 shrink-0 items-center gap-1 rounded-none bg-subtle px-3.5 text-[13px]">
          <input aria-label="Cijena od" type="number" min={0} placeholder="Od" defaultValue={params.get("min") ?? ""} onBlur={(e) => set("min", e.target.value || null)} className="w-10 bg-transparent outline-none placeholder:text-ink" />
          <span className="text-muted">–</span>
          <input aria-label="Cijena do" type="number" min={0} placeholder="Do KM" defaultValue={params.get("max") ?? ""} onBlur={(e) => set("max", e.target.value || null)} className="w-14 bg-transparent outline-none placeholder:text-ink" />
        </div>
        {active && (
          <button onClick={() => startTransition(() => router.replace(category && !hideCategories ? `${pathname}?category=${category}` : pathname, { scroll: false }))} className="h-8 px-2 text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
            Poništi
          </button>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-3 text-[13px]">
          <select aria-label="Sortiraj" className={selectClass} value={params.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value || null)}>
            <option value="">Najnovije</option>
            <option value="price_asc">Cijena ↑</option>
            <option value="price_desc">Cijena ↓</option>
            <option value="popular">Popularno</option>
          </select>
        </div>
      </div>
    </div>
  );
}
