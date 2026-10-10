"use client";

import {
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTripQuery } from "@/components/back-button";
import { OpenStatus } from "@/components/open-status";
import { PlacesMap } from "@/components/places-map";
import { findArea } from "@/data/areas";
import { CATEGORIES, type Category, isCategory } from "@/data/constants";
import type { Place } from "@/data/places";
import { distanceKm, formatDistance } from "@/lib/distance";
import { openStatus } from "@/lib/opening";

type Sort = "default" | "name" | "nearest";
type Status = "open" | "closed";
type Point = { lat: number; lng: number };

const SORTS: Sort[] = ["default", "name", "nearest"];
const DISTANCES = [1, 3, 5, 10]; // km

// Lowercase and strip accents, so "cafe" matches "Café"
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// Write params to the URL without a server round trip. Next's router stays in
// sync, so useSearchParams re-renders. Empty values are dropped.
function setParams(changes: Record<string, string | null>) {
  const next = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  // Commas are safe in a query string; keep "cafe,mall" readable
  const qs = next.toString().replaceAll("%2C", ",");
  window.history.replaceState(
    null,
    "",
    qs ? `?${qs}` : window.location.pathname,
  );
}

const field =
  "w-full cursor-pointer rounded-xl bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

// All filter state lives in the URL:
// ?view=list&category=cafe,mall&q=kopi&status=open&within=3&sort=nearest
export function PlacesBrowser({ places }: { places: Place[] }) {
  const params = useSearchParams();
  // Anything invalid in the URL falls back to the default
  const view = params.get("view") === "list" ? "list" : "map";
  const query = params.get("q") ?? "";
  const categoryParam = params.get("category") ?? "";
  // Memoized so it's stable between renders with the same URL
  const categories = useMemo(
    () => categoryParam.split(",").filter(isCategory),
    [categoryParam],
  );
  const statusParam = params.get("status");
  const status: Status | null =
    statusParam === "open" || statusParam === "closed" ? statusParam : null;
  const withinParam = Number(params.get("within"));
  const within = DISTANCES.includes(withinParam) ? withinParam : null;
  // Trip context from the home flow: a starting area and a leaving time
  const area = findArea(params.get("from"));
  const atParam = params.get("at");
  const at = useMemo(() => {
    const date = atParam ? new Date(atParam) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }, [atParam]);
  const sortParam = params.get("sort") as Sort | null;
  const pickedSort = sortParam && SORTS.includes(sortParam) ? sortParam : null;

  const [showFilters, setShowFilters] = useState(false);
  // "Now" only exists in the browser; null until mounted
  const [now, setNow] = useState<Date | null>(null);
  const [me, setMe] = useState<Point | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Distances start from the chosen area, else from the user
  const origin = area ?? me;
  // Open/closed is judged at the leaving time, else right now
  const time = at ?? now;

  // No sort in the URL: nearest once we have a starting point
  const sort: Sort = pickedSort ?? (origin ? "nearest" : "default");

  // Distance features need location; ask only when the user picks one.
  // On failure, undo the change that needed it.
  function needLocation(undo: Record<string, string | null>) {
    setLocateError(null);
    if (origin) return;
    if (!navigator.geolocation) {
      setParams(undo);
      setLocateError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMe({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setParams(undo);
        setLocateError("Couldn't get your location.");
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  function changeSort(next: Sort) {
    setParams({ sort: next });
    if (next === "nearest") needLocation({ sort: "default" });
  }

  function changeWithin(next: string) {
    setParams({ within: next || null });
    if (next) needLocation({ within: null });
  }

  function toggleCategory(c: Category) {
    const next = categories.includes(c)
      ? categories.filter((x) => x !== c)
      : [...categories, c];
    setParams({ category: next.join(",") || null });
  }

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Only offer categories that actually have places
  const available = useMemo(
    () =>
      (Object.keys(CATEGORIES) as Category[]).filter((c) =>
        places.some((p) => p.categories.includes(c)),
      ),
    [places],
  );

  // Filters apply to both map and list
  const matches = useMemo(() => {
    const q = normalize(query.trim());
    return places
      .map((place) => ({
        place,
        km: origin ? distanceKm(origin, place) : null,
      }))
      .filter(({ place, km }) => {
        // A place matches if any of its categories is selected
        if (
          categories.length &&
          !place.categories.some((c) => categories.includes(c))
        ) {
          return false;
        }
        if (status) {
          // Unknown hours match neither "open" nor "closed"
          if (!time || !place.hours || !place.timezone) return false;
          const open = openStatus(place.hours, place.timezone, time).open;
          if (open !== (status === "open")) return false;
        }
        if (within && (km === null || km > within)) return false;
        if (!q) return true;
        return [place.name, place.address, place.description].some(
          (field) => field && normalize(field).includes(q),
        );
      });
  }, [places, query, categories, status, within, time, origin]);

  // Sorting only matters for the list
  const results = useMemo(() => {
    const sorted = [...matches];
    if (sort === "name") {
      sorted.sort((a, b) =>
        a.place.name.localeCompare(b.place.name, undefined, {
          sensitivity: "base",
        }),
      );
    } else if (sort === "nearest" && origin) {
      sorted.sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
    }
    return sorted;
  }, [matches, sort, origin]);

  const activeFilters =
    (categories.length ? 1 : 0) + (status ? 1 : 0) + (within ? 1 : 0);
  const filtered = query.trim() !== "" || activeFilters > 0;

  // "Cafés & Malls" when categories are picked, else "All places"
  const title = categories.length
    ? new Intl.ListFormat("en", { type: "conjunction" }).format(
        categories.map((c) => CATEGORIES[c].plural),
      )
    : "All places";

  const anyClosed = Boolean(
    time &&
      matches.some(
        ({ place }) =>
          place.hours &&
          place.timezone &&
          !openStatus(place.hours, place.timezone, time).open,
      ),
  );

  const mapCategories = available.filter((c) =>
    matches.some(({ place }) => place.categories.includes(c)),
  );

  const clearAll = () =>
    setParams({ q: null, category: null, status: null, within: null });

  // Short summary of active filters for the map pill
  const summary = [
    ...categories.map((c) => CATEGORIES[c].label),
    status === "open" ? "Open now" : status === "closed" ? "Closed now" : null,
    within ? `Within ${within} km` : null,
    query.trim() ? `“${query.trim()}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* No visible heading; screen readers still get the page title */}
      <h1 className="sr-only">{title}</h1>

      {(area || at) && (
        <p className="flex flex-wrap items-center gap-x-1.5 pb-3 text-sm text-muted-foreground">
          {area && <span>From {area.name}</span>}
          {area && at && <span aria-hidden>·</span>}
          {at && (
            <span>
              Leaving{" "}
              {at.toLocaleString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
                hourCycle: "h12",
              })}
            </span>
          )}
          <Link
            href="/"
            className="ml-1 font-medium text-foreground underline underline-offset-2"
          >
            Change
          </Link>
        </p>
      )}

      <div
        role="tablist"
        aria-label="View"
        className="mb-4 inline-grid grid-cols-2 self-start rounded-xl bg-muted p-1 text-sm font-medium"
      >
        {(["map", "list"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={view === t}
            onClick={() => setParams({ view: t === "map" ? null : t })}
            className="cursor-pointer rounded-lg px-5 py-1.5 capitalize text-muted-foreground aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-sm"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search and filters live in list mode only */}
      {view === "list" && (
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search places</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setParams({ q: e.target.value })}
                placeholder="Search places"
                className="w-full rounded-xl bg-muted py-2.5 pr-3 pl-9 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
            </label>
            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="filters"
              onClick={() => setShowFilters(!showFilters)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-muted px-3 text-sm font-medium aria-expanded:bg-primary aria-expanded:text-primary-foreground"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters
              {activeFilters > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs text-background">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div id="filters" className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Category</span>
                <CategorySelect
                  options={available}
                  selected={categories}
                  onToggle={toggleCategory}
                  onClear={() => setParams({ category: null })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <OptionSelect
                  label="Status"
                  value={status ?? "any"}
                  onChange={(v) =>
                    setParams({ status: v === "any" ? null : v })
                  }
                  disabled={!now}
                  options={[
                    { value: "any", label: "Any" },
                    { value: "open", label: "Open now" },
                    { value: "closed", label: "Closed now" },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Distance</span>
                <OptionSelect
                  label="Distance"
                  value={within ? String(within) : "any"}
                  onChange={(v) => changeWithin(v === "any" ? "" : v)}
                  disabled={locating}
                  align="right"
                  options={[
                    { value: "any", label: "Any" },
                    ...DISTANCES.map((km) => ({
                      value: String(km),
                      label: `Within ${km} km`,
                    })),
                  ]}
                />
              </div>
            </div>
          )}

          {(locating || locateError) && (
            <output className="text-xs">
              {locating ? "Getting your location…" : locateError}
            </output>
          )}

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <p aria-live="polite">
                {filtered
                  ? `${matches.length} of ${places.length} places`
                  : `${places.length} ${places.length === 1 ? "place" : "places"}`}
              </p>
              {filtered && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer underline underline-offset-2 hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span aria-hidden>Sort</span>
              <OptionSelect
                label="Sort"
                value={sort}
                onChange={(v) => changeSort(v as Sort)}
                disabled={locating}
                compact
                align="right"
                options={[
                  { value: "default", label: "Default" },
                  { value: "name", label: "Name (A–Z)" },
                  { value: "nearest", label: "Nearest" },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Kept mounted while hidden so switching tabs doesn't reload the map */}
      <div role="tabpanel" hidden={view !== "map"} className="relative">
        <PlacesMap
          places={matches.map(({ place }) => place)}
          onLocate={setMe}
          time={time}
          origin={area}
          className="h-[55dvh] min-h-80"
        />
        {/* Filters still apply on the map; this pill says so */}
        {summary && (
          <div className="absolute top-3 left-3 z-10 flex max-w-[calc(100%-4.5rem)] items-center rounded-full bg-white text-xs font-medium text-neutral-900 shadow-md">
            <button
              type="button"
              onClick={() => {
                setParams({ view: "list" });
                setShowFilters(true);
              }}
              className="cursor-pointer truncate py-1.5 pl-3"
              title="Edit filters"
            >
              {summary} · {matches.length}{" "}
              {matches.length === 1 ? "place" : "places"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear filters"
              className="cursor-pointer p-1.5 pr-2"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        )}
        {/* Legend: categories currently on the map, plus the user if located */}
        {(mapCategories.length > 0 || anyClosed || area || me) && (
          <ul className="flex flex-wrap gap-x-4 gap-y-2 pt-3 text-xs text-muted-foreground">
            {mapCategories.map((c) => {
              const { icon: Icon, label } = CATEGORIES[c];
              return (
                <li key={c} className="flex items-center gap-1.5">
                  <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
                  {label}
                </li>
              );
            })}
            {anyClosed && (
              <li className="flex items-center gap-1.5">
                <span
                  className="size-3 rounded-full bg-neutral-300 ring-2 ring-white"
                  aria-hidden
                />
                Closed
              </li>
            )}
            {(area || me) && (
              <li className="flex items-center gap-1.5">
                {/* Same look as MapLibre's location dot */}
                <span
                  className="size-3 rounded-full bg-[#1da1f2] shadow ring-2 ring-white"
                  aria-hidden
                />
                {/* The starting point: a chosen area, else the user */}
                {area ? area.name : "You"}
              </li>
            )}
          </ul>
        )}
      </div>

      <div role="tabpanel" hidden={view !== "list"}>
        {results.length > 0 ? (
          <ul className="flex flex-col">
            {results.map(({ place, km }) => (
              <PlaceItem
                key={place.id}
                place={place}
                at={at}
                distance={km === null ? undefined : formatDistance(km)}
              />
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            {filtered ? "No places match." : "Nothing here yet."}
          </p>
        )}
      </div>
    </>
  );
}

// Shared popover for every dropdown: a <details> with our own trigger, closed
// on outside click or Escape. Children get `close` for pick-one menus.
function Dropdown({
  label,
  summary,
  compact = false,
  disabled = false,
  align = "left",
  children,
}: {
  label: string;
  summary: string;
  compact?: boolean;
  disabled?: boolean;
  align?: "left" | "right";
  children: (close: () => void) => ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  useEffect(() => {
    const onEvent = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !el.contains(e.target as Node)
      ) {
        el.open = false;
      }
    };
    document.addEventListener("pointerdown", onEvent);
    document.addEventListener("keydown", onEvent);
    return () => {
      document.removeEventListener("pointerdown", onEvent);
      document.removeEventListener("keydown", onEvent);
    };
  }, []);

  return (
    <details
      ref={ref}
      // <details> can't be disabled; keep it shut instead
      onToggle={(e) => {
        if (disabled) e.currentTarget.open = false;
      }}
      className="group relative"
    >
      <summary
        aria-disabled={disabled || undefined}
        className={`flex list-none items-center justify-between gap-1 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&::-webkit-details-marker]:hidden ${
          compact
            ? "cursor-pointer rounded-lg bg-muted py-1 pr-2 pl-2 text-xs font-medium text-foreground"
            : field
        }`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          className={`shrink-0 transition-transform group-open:rotate-180 ${compact ? "size-3.5" : "size-4"}`}
          aria-hidden
        />
      </summary>
      <fieldset
        className={`absolute z-20 mt-1 flex w-full min-w-44 flex-col rounded-xl border border-border bg-background p-1 text-sm font-normal shadow-lg ${align === "right" ? "right-0" : "left-0"}`}
      >
        <legend className="sr-only">{label}</legend>
        {children(close)}
      </fieldset>
    </details>
  );
}

const optionRow =
  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted";

// Pick-one dropdown (radio buttons); closes on pick
function OptionSelect({
  label,
  options,
  value,
  onChange,
  ...rest
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  disabled?: boolean;
  align?: "left" | "right";
}) {
  const name = useId();
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <Dropdown label={label} summary={current.label} {...rest}>
      {(close) =>
        options.map((o) => (
          <label key={o.value} className={optionRow}>
            <input
              type="radio"
              name={name}
              checked={o.value === value}
              onChange={() => {
                onChange(o.value);
                close();
              }}
              className="size-4 accent-primary"
            />
            {o.label}
          </label>
        ))
      }
    </Dropdown>
  );
}

// Pick-many dropdown (checkboxes); stays open while ticking
function CategorySelect({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: Category[];
  selected: Category[];
  onToggle: (c: Category) => void;
  onClear: () => void;
}) {
  const summary =
    selected.length === 0
      ? "All"
      : selected.length === 1
        ? CATEGORIES[selected[0]].label
        : `${selected.length} selected`;

  return (
    <Dropdown label="Categories" summary={summary}>
      {() => (
        <>
          {options.map((c) => (
            <label key={c} className={optionRow}>
              <input
                type="checkbox"
                checked={selected.includes(c)}
                onChange={() => onToggle(c)}
                className="size-4 accent-primary"
              />
              {CATEGORIES[c].label}
            </label>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 cursor-pointer rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted"
            >
              Clear
            </button>
          )}
        </>
      )}
    </Dropdown>
  );
}

// Every optional field renders only when the data has it
function PlaceItem({
  place,
  distance,
  at,
}: {
  place: Place;
  distance?: string;
  at: Date | null;
}) {
  const tripQuery = useTripQuery();
  const { icon: Icon } = CATEGORIES[place.categories[0]];
  const label = place.categories.map((c) => CATEGORIES[c].label).join(" · ");

  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        href={`/places/${place.id}${tripQuery}`}
        className="group flex items-center gap-3 py-4"
      >
        {place.image ? (
          <Image
            src={place.image}
            alt=""
            width={64}
            height={64}
            // Remote images skip Next's optimizer, so any https host works
            unoptimized={place.image.startsWith("https://")}
            className="size-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Icon className="size-4" strokeWidth={2.25} aria-hidden />
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div>
            <h2 className="text-lg font-semibold group-hover:underline underline-offset-4">
              {place.name}
            </h2>
            <p className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
              {label}
              {distance && <span>{distance} away</span>}
              {place.hours && place.timezone && (
                <OpenStatus
                  hours={place.hours}
                  timezone={place.timezone}
                  at={at ?? undefined}
                />
              )}
            </p>
          </div>

          {place.address && (
            <p className="text-xs text-muted-foreground">{place.address}</p>
          )}

          {place.description && (
            <p className="line-clamp-2 text-sm">{place.description}</p>
          )}
        </div>

        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}
