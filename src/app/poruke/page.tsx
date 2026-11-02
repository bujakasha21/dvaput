import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Poruke" };

export default function MessagesPage() {
  return (
    <div className="hidden flex-col items-center justify-center p-8 text-center md:flex">
      <div className="mb-4 text-muted">
        <MessageCircle className="size-6 stroke-[1.5]" />
      </div>
      <h2 className="font-medium">Izaberi razgovor</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">Ovdje dogovaraš cijenu, slanje ili preuzimanje — bez dijeljenja broja telefona.</p>
    </div>
  );
}
