"use client";

import { Bookmark } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { toggleSaved, useSaved } from "@/lib/saved";

// Bookmark toggle for one place. Filled when saved.
export function SaveButton({
  id,
  name,
  className = "",
}: {
  id: number;
  name: string;
  className?: string;
}) {
  const { t } = useI18n();
  const saved = useSaved().includes(id);

  return (
    <button
      type="button"
      onClick={() => toggleSaved(id)}
      // Fixed name plus pressed state, so screen readers say "Save X, pressed"
      aria-pressed={saved}
      aria-label={t.saved.save(name)}
      title={saved ? t.saved.saved : t.saved.saveShort}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-xl text-foreground ${className}`}
    >
      <Bookmark
        className={`size-5 ${saved ? "fill-primary text-primary" : ""}`}
        aria-hidden
      />
    </button>
  );
}
