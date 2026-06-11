import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const perfil = token?.perfil ?? "SUSEL";
    const pathname = req.nextUrl.pathname;

    if (perfil === "GRANDE_AREA") {
      const bloqueadas = ["/dashboard", "/configuracoes", "/admin"];
      if (bloqueadas.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/estagiarios", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|avaliar).*)",
  ],
};