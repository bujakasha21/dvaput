import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistična provjera: bez session cookieja odmah na login. Prava provjera je na serveru.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/prijava", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/moj-ormar/:path*", "/poruke/:path*", "/oglasi/novi", "/oglasi/:id/uredi"],
};
