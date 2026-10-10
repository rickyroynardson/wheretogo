"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const ROW = 40; // px, height of one wheel row
const DAYS_AHEAD = 14;
const MINUTES = [0, 15, 30, 45];

type Choice = { day: number; hour: number; minute: number };

const pad = (n: number) => String(n).padStart(2, "0");

// 19:30 -> "7:30 pm"
const clock12 = (hour: number, minute: number) =>
  `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "am" : "pm"}`;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDate(choice: Choice, today: Date) {
  const d = new Date(today);
  d.setDate(d.getDate() + choice.day);
  d.setHours(choice.hour, choice.minute, 0, 0);
  return d;
}

function fromDate(date: Date, today: Date): Choice {
  const day = Math.round(
    (startOfDay(date).getTime() - today.getTime()) / 86_400_000,
  );
  return { day, hour: date.getHours(), minute: date.getMinutes() };
}

// Next quarter hour from now, e.g. 19:07 -> 19:15
function nextQuarter(now: Date) {
  const d = new Date(now);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil((d.getMinutes() + 1) / 15) * 15);
  return d;
}

function dayLabel(offset: number, today: Date) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

// Quick picks for going out, not commuting
function presets(now: Date, today: Date) {
  const at = (day: number, hour: number) =>
    toDate({ day, hour, minute: 0 }, today);
  const inAnHour = nextQuarter(new Date(now.getTime() + 45 * 60_000));
  const tonight = at(0, 19);
  // Saturday 10:00, or next week's if today is already the weekend
  const toSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const list = [
    { label: "In 1 hour", date: inAnHour },
    { label: "Tonight 7 pm", date: tonight },
    { label: "Tomorrow lunch", date: at(1, 12) },
    { label: "This weekend", date: at(toSaturday, 10) },
  ];
  return list.filter((p) => p.date > now);
}

export function TimePicker({ onPick }: { onPick: (date: Date) => void }) {
  // Clock is read once when the picker opens (it only mounts in the drawer)
  const [now] = useState(() => new Date());
  const today = useMemo(() => startOfDay(now), [now]);
  const [choice, setChoice] = useState(() => fromDate(nextQuarter(now), today));

  const picked = toDate(choice, today);
  const inPast = picked < now;

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => ({
    value: i,
    label: dayLabel(i, today),
  }));
  // Wheels show a 12-hour clock; the choice itself stays 0-23
  const hours = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));
  const periods = [
    { value: 0, label: "am" },
    { value: 1, label: "pm" },
  ];
  const pm = choice.hour >= 12 ? 1 : 0;
  const minutes = MINUTES.map((m) => ({ value: m, label: pad(m) }));

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
        {presets(now, today).map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setChoice(fromDate(p.date, today))}
            className="shrink-0 cursor-pointer rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative grid grid-cols-[2fr_1fr_1fr_1fr]">
        {/* Selection marker: two thin lines around the middle row */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 border-y-2 border-primary"
          aria-hidden
        />
        <Wheel
          label="Day"
          options={days}
          value={choice.day}
          // Functional update: wheels commit on a delay, so never use a stale `choice`
          onChange={(day) => setChoice((c) => ({ ...c, day }))}
        />
        <Wheel
          label="Hour"
          options={hours}
          value={choice.hour % 12 || 12}
          onChange={(h12) =>
            setChoice((c) => ({
              ...c,
              hour: (h12 % 12) + (c.hour >= 12 ? 12 : 0),
            }))
          }
        />
        <Wheel
          label="Minute"
          options={minutes}
          value={choice.minute}
          onChange={(minute) => setChoice((c) => ({ ...c, minute }))}
        />
        <Wheel
          label="AM or PM"
          options={periods}
          value={pm}
          onChange={(period) =>
            setChoice((c) => ({ ...c, hour: (c.hour % 12) + period * 12 }))
          }
        />
      </div>

      <button
        type="button"
        disabled={inPast}
        onClick={() => onPick(picked)}
        className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {inPast
          ? "Pick a later time"
          : `Show places · ${dayLabel(choice.day, today)} ${clock12(choice.hour, choice.minute)}`}
      </button>
    </div>
  );
}

// One scroll-snap column. Native scrolling gives the flick/momentum feel;
// we only read which row settled in the middle.
function Wheel({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  // Scroll to the value when it changes from outside (presets, keys, taps)
  useEffect(() => {
    const el = ref.current;
    if (!el || Math.round(el.scrollTop / ROW) === index) return;
    // First paint happens before the drawer finishes opening; wait a frame
    const frame = requestAnimationFrame(() =>
      el.scrollTo({ top: index * ROW, behavior: "smooth" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [index]);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      aria-activedescendant={`${id}-${value}`}
      tabIndex={0}
      onScroll={(e) => {
        const el = e.currentTarget;
        // Commit once scrolling stops, so mid-flick rows don't fire changes
        clearTimeout(settle.current);
        settle.current = setTimeout(() => {
          const next = options[Math.round(el.scrollTop / ROW)];
          if (next && next.value !== value) onChange(next.value);
        }, 120);
      }}
      onKeyDown={(e) => {
        const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = options[index + step];
        if (next) onChange(next.value);
      }}
      className="h-50 snap-y snap-mandatory overflow-y-scroll py-20 outline-none [mask-image:linear-gradient(transparent,black_35%,black_65%,transparent)] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-primary"
    >
      {options.map((o) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: arrow keys on the listbox handle keyboard
        <div
          key={o.value}
          id={`${id}-${o.value}`}
          role="option"
          aria-selected={o.value === value}
          tabIndex={-1}
          onClick={() => onChange(o.value)}
          className="grid h-10 cursor-pointer snap-center place-items-center text-base text-muted-foreground tabular-nums aria-selected:font-semibold aria-selected:text-foreground"
        >
          {o.label}
        </div>
      ))}
    </div>
  );
}
