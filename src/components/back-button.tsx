"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Becomes true once the user has moved between pages inside the site, so
// browser Back stays in the app. Module state survives client navigations.
let navigatedInApp = false;

// Mounted once in the root layout. Compares against the first pathname
// (not "first effect run") so React's dev double-mount can't fake a nav.
export function NavigationTracker() {
  const pathname = usePathname();
  const initial = useRef(pathname);
  useEffect(() => {
    if (pathname !== initial.current) navigatedInApp = true;
  }, [pathname]);
  return null;
}

// Back like the browser's Back (keeps filters, area, time and scroll on the
// previous page); falls back to a link when the page was opened directly.
export function BackButton({
  fallback,
  label = "Back",
}: {
  fallback: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      aria-label={label}
      onClick={(e) => {
        if (!navigatedInApp) return;
        e.preventDefault();
        router.back();
      }}
      className="-ml-1.5 self-start text-foreground"
    >
      <ChevronLeft className="size-7" aria-hidden />
    </Link>
  );
}

// Trip context (starting area and leaving time) to carry into place links
export function useTripQuery() {
  const params = useSearchParams();
  const keep = new URLSearchParams();
  for (const key of ["from", "at"]) {
    const value = params.get(key);
    if (value) keep.set(key, value);
  }
  const qs = keep.toString().replaceAll("%3A", ":");
  return qs ? `?${qs}` : "";
}
