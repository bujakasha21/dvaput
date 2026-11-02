"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function DashboardTabs({ active, tabs }: { active: string; tabs: { key: string; label: string; count: number }[] }) {
  return (
    <div className="no-scrollbar flex gap-6 overflow-x-auto">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.key === "aktivni" ? "/moj-ormar" : `/moj-ormar?tab=${t.key}`}
          scroll={false}
          className={cn("relative pb-3 text-sm whitespace-nowrap transition-colors", active === t.key ? "text-ink" : "text-muted hover:text-ink")}
        >
          {t.label} <span className="text-xs text-muted tabular-nums">{t.count}</span>
          {active === t.key && <motion.span layoutId="dash-tab" className="absolute inset-x-0 -bottom-px h-px bg-ink" transition={{ type: "spring", bounce: 0, duration: 0.35 }} />}
        </Link>
      ))}
    </div>
  );
}
