"use client";

import { Bookmark, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { useSaved } from "@/lib/saved";

// Home page shortcut to the saved list; hidden until something is saved
export function SavedLink({ placeIds }: { placeIds: number[] }) {
  const { t, path } = useI18n();
  // Ignore bookmarks of places that were since removed from the data
  const count = useSaved().filter((id) => placeIds.includes(id)).length;
  if (count === 0) return null;

  return (
    <Link
      href={path("/places?view=list&saved=1")}
      className="flex items-center gap-3 border-t border-border py-4 font-medium group"
    >
      <Bookmark className="size-6 text-primary" aria-hidden />
      <span className="group-hover:underline underline-offset-4">
        {t.saved.homeLink(count)}
      </span>
      <ChevronRight
        className="ml-auto size-5 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}
