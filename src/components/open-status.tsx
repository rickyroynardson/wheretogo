"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Hours } from "@/data/places";
import { openStatus, type OpenStatus as Status } from "@/lib/opening";

// Pages are prebuilt, so "now" is only known in the browser. Renders nothing
// on the server and first paint, then updates every minute.
export function OpenStatus({
  hours,
  timezone,
  at,
  badge = false,
}: {
  hours: Hours;
  timezone: string;
  // Pill style for the details page: blue when open, gray when closed
  badge?: boolean;
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

  if (badge) {
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
      >
        {status.label}
      </span>
    );
  }

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

// Open status at the trip's leaving time (?at=…) when one was chosen
export function TripOpenStatus({
  hours,
  timezone,
  badge,
}: {
  hours: Hours;
  timezone: string;
  badge?: boolean;
}) {
  const atParam = useSearchParams().get("at");
  const at = useMemo(() => {
    const date = atParam ? new Date(atParam) : null;
    return date && !Number.isNaN(date.getTime()) ? date : undefined;
  }, [atParam]);
  return <OpenStatus hours={hours} timezone={timezone} at={at} badge={badge} />;
}
