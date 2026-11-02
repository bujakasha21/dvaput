import Link from "next/link";
import { getSession } from "@/lib/auth";
import { unreadCount } from "@/lib/queries";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { SearchBar } from "./search-bar";
import { ShopLinks } from "./shop-links";
import { MobileMenu } from "./mobile-menu";

export async function Navbar() {
  const session = await getSession();
  const unread = session ? await unreadCount(session.user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-8">
        <MobileMenu loggedIn={Boolean(session)} />
        <Logo />
        <ShopLinks className="hidden items-center gap-5 border-l border-line pl-6 lg:flex" />
        <div className="hidden flex-1 justify-end md:flex lg:justify-center">
          <SearchBar />
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm">
          {session ? (
            <>
              <Link href="/oglasi/novi" className="mr-2 hidden h-9 items-center rounded-none bg-ink px-4 font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-flex">
                Prodaj
              </Link>
              <UserMenu user={{ id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image ?? null }} unread={unread} />
            </>
          ) : (
            <>
              <Link href="/prijava" className="h-9 rounded-none px-4 leading-9 font-medium text-muted transition-colors hover:text-ink">
                Prijava
              </Link>
              <Link href="/registracija" className="hidden h-9 rounded-none bg-ink px-4 leading-9 sm:block font-medium text-white transition-colors hover:bg-neutral-800">
                Registracija
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
