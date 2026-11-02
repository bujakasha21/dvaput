"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleLike } from "@/app/actions/listings";
import { cn } from "@/lib/utils";

type Props = { listingId: string; liked: boolean; count?: number; variant?: "floating" | "pill" };

export function LikeButton({ listingId, liked, count, variant = "floating" }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ liked, count: count ?? 0 });

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setState((s) => ({ liked: !s.liked, count: s.count + (s.liked ? -1 : 1) }));
      const res = await toggleLike(listingId);
      if ("error" in res) {
        toast("Prijavi se da sačuvaš artikal", { action: { label: "Prijava", onClick: () => router.push("/prijava") } });
        return;
      }
      router.refresh();
    });
  }

  if (variant === "pill") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-none border px-5 text-sm font-medium transition-colors active:scale-[0.98]",
          state.liked ? "border-ink" : "border-line hover:border-ink",
        )}
      >
        <Heart key={String(state.liked)} className={cn("size-4 stroke-[1.75]", state.liked && "animate-pop fill-like text-like")} />
        {state.count}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={state.liked ? "Ukloni iz sačuvanih" : "Sačuvaj"}
      data-liked={state.liked}
      className="grid size-8 place-items-center rounded-none bg-white transition-transform active:scale-90"
    >
      <Heart key={String(state.liked)} className={cn("size-4 stroke-[1.75]", state.liked ? "animate-pop fill-like text-like" : "text-ink")} />
    </button>
  );
}
