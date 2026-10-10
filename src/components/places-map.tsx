"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { ChevronRight } from "lucide-react";
import type {
  Map as MapInstance,
  Marker as MarkerClass,
  Popup as PopupClass,
} from "maplibre-gl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTripQuery } from "@/components/back-button";
import { CATEGORIES } from "@/data/constants";
import type { Place } from "@/data/places";
import { distanceKm, formatDistance } from "@/lib/distance";
import { openStatus } from "@/lib/opening";

// Fallback view when the user's location isn't available
const BATAM: [number, number] = [104.0305, 1.1301];

// Pin is 35px tall; keep popups clear of it whichever side they open on
const POPUP_OFFSET = {
  top: [0, 4],
  "top-left": [0, 4],
  "top-right": [0, 4],
  bottom: [0, -38],
  "bottom-left": [0, -38],
  "bottom-right": [0, -38],
  left: [16, -17],
  right: [-16, -17],
  center: [0, 0],
} satisfies Record<string, [number, number]>;

// Same map style in both themes; only our popups follow dark mode
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// MapLibre owns these DOM nodes; React renders into them via portals
type Slot = { place: Place; pin: HTMLElement; popup: HTMLElement };

type Point = { lat: number; lng: number };

export function PlacesMap({
  places,
  className = "h-90",
  onLocate,
  time,
  origin,
}: {
  places: Place[];
  className?: string;
  // A chosen starting area: shown as the "you" dot, used for distances,
  // and the map starts there instead of jumping to the device location
  origin?: { lat: number; lng: number; name: string } | null;
  // Pins of places closed at this moment turn gray; null until known
  time?: Date | null;
  // Called with the user's position whenever the map gets a location fix
  onLocate?: (point: Point) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  // Ref so a new callback identity doesn't rebuild the whole map
  const onLocateRef = useRef(onLocate);
  useEffect(() => {
    onLocateRef.current = onLocate;
  }, [onLocate]);
  const originRef = useRef(origin);
  useEffect(() => {
    originRef.current = origin;
  }, [origin]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const tripQuery = useTripQuery();
  const [me, setMe] = useState<Point | null>(null);
  // Set once the map exists; markers sync against it without rebuilding it
  const [ready, setReady] = useState<{
    map: MapInstance;
    Marker: typeof MarkerClass;
    Popup: typeof PopupClass;
  } | null>(null);

  // Create the map once
  useEffect(() => {
    let map: MapInstance | undefined;
    let cancelled = false;

    // MapLibre needs window, so load it only in the browser
    import("maplibre-gl").then(
      ({ Map: MapLibre, Marker, Popup, GeolocateControl, setWorkerUrl }) => {
        if (cancelled || !container.current) return;

        // MapLibre resolves its worker next to its own file, which breaks once
        // bundled. Let the bundler emit the worker and point MapLibre at it.
        setWorkerUrl(
          new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)
            .href,
        );

        const m = new MapLibre({
          container: container.current,
          style: MAP_STYLE,
          center: BATAM,
          zoom: 11,
          attributionControl: { compact: true },
        });
        map = m;

        // OpenFreeMap styles reference a few POI icons missing from their
        // sprite. Fill gaps with a transparent pixel instead of console warnings.
        m.setMissingStyleImageResolver((id) => {
          m.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
        });

        // Locate button + live "you are here" dot; needs HTTPS (localhost is fine).
        // Auto-locate on load. If permission is denied or unavailable, the map
        // stays on Batam.
        const geolocate = new GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          // Default zooms to street level; stay wide enough to see nearby pins
          fitBoundsOptions: { maxZoom: 12 },
        });
        m.addControl(geolocate);
        // Fires on first fix and on every update while tracking
        geolocate.on("geolocate", ({ coords }) => {
          const point = { lat: coords.latitude, lng: coords.longitude };
          setMe(point);
          onLocateRef.current?.(point);
        });
        // With a chosen starting area, stay there; the locate button still works
        m.once("load", () => {
          if (!originRef.current) geolocate.trigger();
        });

        setReady({ map: m, Marker, Popup });
      },
    );

    return () => {
      cancelled = true;
      map?.remove();
      setReady(null);
    };
  }, []);

  // Starting-area dot, styled like MapLibre's own location dot
  useEffect(() => {
    if (!ready || !origin) return;
    const { map, Marker } = ready;
    const dot = document.createElement("div");
    dot.className =
      "size-4 rounded-full border-[3px] border-white bg-[#1da1f2] shadow-md";
    dot.setAttribute("role", "img");
    dot.setAttribute("aria-label", `Starting point: ${origin.name}`);
    const marker = new Marker({ element: dot })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);
    map.jumpTo({ center: [origin.lng, origin.lat], zoom: 12 });
    return () => {
      marker.remove();
    };
  }, [ready, origin]);

  // Sync markers whenever the (filtered) places change
  useEffect(() => {
    if (!ready) return;
    const { map, Marker, Popup } = ready;
    const markers: MarkerClass[] = [];
    const next = places.map((place) => {
      const pin = document.createElement("div");
      const popup = document.createElement("div");
      // anchor "bottom" puts the pin tip exactly on the coordinate
      markers.push(
        new Marker({ element: pin, anchor: "bottom" })
          .setLngLat([place.lng, place.lat])
          .setPopup(
            // No X: tapping the map or another pin closes it
            new Popup({
              offset: POPUP_OFFSET,
              closeButton: false,
              maxWidth: "none",
            }).setDOMContent(popup),
          )
          .addTo(map),
      );
      return { place, pin, popup };
    });
    setSlots(next);

    return () => {
      for (const marker of markers) marker.remove();
      setSlots([]);
    };
  }, [ready, places]);

  return (
    <>
      <div
        ref={container}
        className={`overflow-hidden rounded-2xl bg-muted ${className}`}
      />
      {slots.map(({ place, pin, popup }) => {
        // Pin shows the main (first) category; popup lists them all
        const { icon: Icon } = CATEGORIES[place.categories[0]];
        const label = place.categories
          .map((c) => CATEGORIES[c].label)
          .join(" · ");
        // Distances from the chosen area if any, else from the device
        const from = origin ?? me;
        const distance = from ? formatDistance(distanceKm(from, place)) : null;
        // Unknown hours: no status shown, pin stays blue
        const status =
          time && place.hours && place.timezone
            ? openStatus(place.hours, place.timezone, time)
            : null;
        const closed = status ? !status.open : false;
        return [
          createPortal(
            <button
              type="button"
              aria-label={[
                place.name,
                closed && "closed",
                distance && `${distance} away`,
              ]
                .filter(Boolean)
                .join(", ")}
              className="relative block h-[35px] w-7 origin-bottom cursor-pointer drop-shadow-md transition-transform hover:scale-115"
            >
              <svg
                viewBox="0 0 24 30"
                className="absolute inset-0 size-full"
                aria-hidden="true"
              >
                <path
                  d="M12 29C12 29 2 19.5 2 12a10 10 0 1 1 20 0c0 7.5-10 17-10 17Z"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  className={`stroke-white ${closed ? "fill-neutral-300" : "fill-primary"}`}
                />
              </svg>
              {/* Centered on the round head of the pin */}
              <span
                className={`absolute inset-x-0 top-0 grid h-7 place-items-center ${closed ? "text-neutral-600" : "text-primary-foreground"}`}
              >
                <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
              </span>
              {/* Map is always the light style, so the badge stays light too */}
              {distance && (
                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[10px] leading-none font-semibold text-neutral-900 shadow-sm">
                  {distance}
                </span>
              )}
            </button>,
            pin,
            `${place.id}-pin`,
          ),
          createPortal(
            // The whole card opens the place; the map closes it
            <Link
              href={`/places/${place.id}${tripQuery}`}
              className="flex w-64 items-center gap-3 p-3"
            >
              {place.image ? (
                <Image
                  src={place.image}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized={place.image.startsWith("https://")}
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                  <Icon className="size-5" strokeWidth={2.25} aria-hidden />
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold">
                  {place.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {[label, distance && `${distance} away`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {status && (
                  <span
                    className={`truncate text-xs font-medium ${status.open ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {status.label}
                  </span>
                )}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>,
            popup,
            `${place.id}-popup`,
          ),
        ];
      })}
    </>
  );
}
