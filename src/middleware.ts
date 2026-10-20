import { NextResponse, type NextRequest } from "next/server";
import { STAFF_AUTH_COOKIE } from "@/lib/auth/constants";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function isStaffAuthed(request: NextRequest) {
  return request.cookies.get(STAFF_AUTH_COOKIE)?.value === "1";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  // Block URL access to the studio unless signed in
  if (isAdminRoute && !isLoginRoute && !isStaffAuthed(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in → skip login
  if (isLoginRoute && isStaffAuthed(request)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
