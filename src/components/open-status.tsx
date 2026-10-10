"use client";

import { useEffect, useState } from "react";
import type { Hours } from "@/data/places";
import { openStatus, type OpenStatus as Status } from "@/lib/opening";

// Pages are prebuilt, so "now" is only known in the browser. Renders nothing
// on the server and first paint, then updates every minute.
export function OpenStatus({
  hours,
  timezone,
  at,
}: {
  hours: Hours;
  timezone: string;
  // A chosen leaving time; without it, status follows the live clock
  at?: Date;
}) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(openStatus(hours, timezone, at));
    update();
    if (at) return;
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [hours, timezone, at]);

  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${status.open ? "text-foreground" : "text-muted-foreground"}`}
    >
      {/* Pastel dot is the accent; text stays neutral */}
      <span
        className={`size-1.5 rounded-full ${status.open ? "bg-primary" : "bg-muted-foreground/50"}`}
        aria-hidden
      />
      {status.label}
    </span>
  );
}

// Shown only when the visitor's timezone differs from the place's
export function LocalTimeNote({ timezone }: { timezone: string }) {
  const [differs, setDiffers] = useState(false);

  useEffect(() => {
    setDiffers(Intl.DateTimeFormat().resolvedOptions().timeZone !== timezone);
  }, [timezone]);

  if (!differs) return null;

  return (
    <p className="text-xs text-muted-foreground">
      Times are local to the place ({timezone.replace("_", " ")})
    </p>
  );
}
