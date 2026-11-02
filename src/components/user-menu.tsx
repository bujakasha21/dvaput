"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, MessageCircle } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Avatar } from "./avatar";

type Props = { user: { id: string; name: string; email: string; image: string | null }; unread: number };

export function UserMenu({ user, unread }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const items = [
    { href: "/oglasi/novi", label: "Prodaj artikal", mobile: true },
    { href: "/moj-ormar", label: "Moji oglasi" },
    { href: "/moj-ormar?tab=sacuvano", label: "Sačuvano" },
    { href: "/poruke", label: "Poruke", badge: unread },
    { href: `/korisnici/${user.id}`, label: "Profil" },
    { href: "/moj-ormar/podesavanja", label: "Postavke" },
  ];

  return (
    <div className="flex items-center gap-1" ref={ref}>
      <Link href="/poruke" className="relative grid size-9 place-items-center rounded-full transition-colors hover:bg-subtle" aria-label="Poruke">
        <MessageCircle className="size-[18px] stroke-[1.75]" />
        {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-like ring-2 ring-white" />}
      </Link>
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} className="ml-1 rounded-full transition-opacity hover:opacity-80" aria-label="Korisnički meni">
          <Avatar name={user.name} image={user.image} size={30} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-line bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="px-4 pt-1 pb-3">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <div className="h-px bg-line" />
              <div className="py-1">
                {items.map(({ href, label, badge, mobile }) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className={`${mobile ? "flex sm:hidden" : "flex"} items-center px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-subtle hover:text-ink`}>
                    <span className="flex-1">{label}</span>
                    {badge ? <span className="text-xs text-like">{badge} nove</span> : null}
                  </Link>
                ))}
              </div>
              <div className="h-px bg-line" />
              <button
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                  router.push("/");
                  router.refresh();
                }}
                className="mt-1 flex w-full items-center gap-2 px-4 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
              >
                <LogOut className="size-3.5" /> Odjava
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
