import { type NextRequest, NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { fromAcceptLanguage } from "@/i18n/negotiate";

// Every page lives under /en or /id. A bare URL ("/places") redirects to the
// visitor's language: their earlier pick (cookie), else the browser's
// languages, else English.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (first && isLocale(first)) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale: Locale =
    saved && isLocale(saved)
      ? saved
      : fromAcceptLanguage(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals and files with an extension (images, logo.svg, ...)
  matcher: ["/((?!_next|.*\\..*).*)"],
};
