"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";

// Icon button that opens the phone's share sheet (WhatsApp, Telegram, ...).
// Where that's missing (most desktops) it copies the link instead, and if
// even that's blocked it opens WhatsApp with the link typed in.
export function ShareButton({
  title,
  text,
  url,
  label,
  className = "",
}: {
  title: string;
  text: string;
  // Path or URL to share; defaults to the current page with its filters
  url?: string;
  // Accessible name, e.g. "Share"
  label: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function share() {
    const href = new URL(url ?? window.location.href, window.location.origin)
      .href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: href });
      } catch {
        // Closing the share sheet rejects; nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text} ${href}`)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={label}
      title={copied ? t.common.linkCopied : label}
      className={`relative flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-muted text-foreground ${className}`}
    >
      {copied ? (
        <Check className="size-5 text-primary" aria-hidden />
      ) : (
        <Share2 className="size-5" aria-hidden />
      )}
      {/* Announced to screen readers; sighted users see the check */}
      <output className="sr-only">{copied ? t.common.linkCopied : ""}</output>
    </button>
  );
}
