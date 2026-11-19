"use client";

import {
  ChevronDown,
  Clock,
  History,
  LocateFixed,
  type LucideIcon,
  MapPin,
  RotateCwFadingClock,
  Search,
  Ship,
  Sparkles,
} from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Drawer } from "@/components/drawer";
import { TimePicker } from "@/components/time-picker";
import { type Area, findArea, searchAreas, TERMINALS } from "@/data/areas";
import { INTENTS, type Intent } from "@/data/intents";
import { useI18n } from "@/i18n/client";

type Step = "what" | "from" | "when";
// null = "Anything"
type What = Intent | null;
// Where the trip starts; null until answered
type From = "me" | Area | null;

// datetime-local value in the device's timezone, e.g. "2026-10-10T19:30"
function localInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Each step rises from below: heading, then cards one after another
const list = { show: { transition: { staggerChildren: 0.04 } } };
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

// Recently picked areas, newest first. Per-browser convenience only.
const RECENT_KEY = "wheretogo:recent-areas";
const MAX_RECENT = 5;

function readRecent(): Area[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    if (!Array.isArray(ids)) return [];
    // Drop ids that no longer exist in the area list
    return ids.map((id) => findArea(String(id))).filter((a) => a !== null);
  } catch {
    return [];
  }
}

function writeRecent(areas: Area[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(areas.map((a) => a.id)));
  } catch {
    // Storage blocked (private mode etc.): recents just won't persist
  }
}

// Home flow: what -> from where -> when -> results. Steps are local state
// (Next keeps the page alive, so it survives navigating away and back);
// only the final answers go into the results URL.
export function TripWizard() {
  const router = useRouter();
  const { t, path } = useI18n();
  const w = t.wizard;
  const [step, setStep] = useState<Step>("what");
  // undefined until answered, so nothing shows as selected on first visit
  const [what, setWhat] = useState<What | undefined>(undefined);
  const [from, setFrom] = useState<From>(null);
  const area = from === "me" ? null : from;
  const terminal = area?.kind === "terminal" ? area : null;
  const [drawer, setDrawer] = useState<"area" | "ferry" | "time" | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaQuery, setAreaQuery] = useState("");
  const [recent, setRecent] = useState<Area[]>([]);

  // Load recents when the area drawer opens (localStorage is browser-only)
  useEffect(() => {
    if (drawer === "area") setRecent(readRecent());
  }, [drawer]);

  function pickArea(a: Area) {
    const next = [a, ...recent.filter((r) => r.id !== a.id)].slice(
      0,
      MAX_RECENT,
    );
    setRecent(next);
    writeRecent(next);
    setFrom(a);
    setDrawer(null);
    setAreaQuery("");
    setError(null);
    setStep("when");
  }

  // My own location is never put in the URL; results read it from the device
  function showResults(options: { area?: Area | null; at?: string } = {}) {
    const params = new URLSearchParams({ view: "list" });
    if (what) params.set("category", what.categories.join(","));
    if (options.area) params.set("from", options.area.id);
    if (options.at) params.set("at", options.at);
    // ":" and "," are safe in a query string; keep the URL readable
    router.push(
      path(
        `/places?${params.toString().replaceAll("%3A", ":").replaceAll("%2C", ",")}`,
      ),
    );
  }

  function useMyLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError(t.common.noGeolocation);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);
        setFrom("me");
        setStep("when");
      },
      () => {
        setLocating(false);
        setError(w.locationFailed);
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  function goTo(target: Step) {
    setError(null);
    setStep(target);
  }
  const query = areaQuery.trim();
  const matches = searchAreas(query);
  // Highlighted result: Enter (the keyboard's Search key) picks it
  const [active, setActive] = useState(0);
  const listId = useId();

  return (
    // reducedMotion="user": no movement for people with reduce-motion on
    <MotionConfig reducedMotion="user">
      <section aria-live="polite">
        {/* Answers so far; tap one to go back and change it */}
        {step !== "what" && (
          <div className="flex flex-wrap gap-2 pb-4">
            <AnswerChip
              label={what ? t.intents[what.id] : w.anything}
              hint={w.changeWhat}
              onClick={() => goTo("what")}
            />
            {step === "when" && (
              <AnswerChip
                label={area ? area.name : w.myLocation}
                hint={w.changeFrom}
                onClick={() => goTo("from")}
              />
            )}
          </div>
        )}

        {/* key={step} replays the rise on every step change */}
        <motion.div key={step} variants={list} initial="hidden" animate="show">
          {step === "what" && (
            <>
              <motion.h2
                variants={item}
                className="pb-3 text-2xl font-semibold text-muted-foreground"
              >
                {w.whatTitle}
              </motion.h2>
              <motion.ul variants={list} className="flex flex-col gap-2">
                {INTENTS.map((intent) => (
                  <Option
                    key={intent.id}
                    icon={intent.icon}
                    label={t.intents[intent.id]}
                    selected={what?.id === intent.id}
                    onClick={() => {
                      setWhat(intent);
                      setStep("from");
                    }}
                  />
                ))}
                <Option
                  icon={Sparkles}
                  label={w.anything}
                  selected={what === null}
                  onClick={() => {
                    setWhat(null);
                    setStep("from");
                  }}
                />
              </motion.ul>
            </>
          )}

          {step === "from" && (
            <>
              <motion.h2
                variants={item}
                className="pb-3 text-2xl font-semibold text-muted-foreground"
              >
                {w.fromTitle}
              </motion.h2>
              <motion.ul variants={list} className="flex flex-col gap-2">
                <Option
                  icon={LocateFixed}
                  // Default answer: active until another place is picked
                  selected={from === null || from === "me"}
                  label={locating ? t.common.locating : w.myLocation}
                  disabled={locating}
                  onClick={useMyLocation}
                />
                <Option
                  icon={Ship}
                  // Visitors from Singapore start at the terminal they land at
                  label={terminal ? terminal.name : w.ferry}
                  hint={terminal ? w.tapToChange : w.ferryHint}
                  selected={terminal !== null}
                  onClick={() => setDrawer("ferry")}
                />
                <Option
                  icon={MapPin}
                  // Once picked, the card shows the area itself
                  label={area && !terminal ? area.name : w.somewhereElse}
                  hint={area && !terminal ? w.tapToChange : undefined}
                  selected={area !== null && !terminal}
                  onClick={() => setDrawer("area")}
                />
                <Option
                  icon={LocateFixed}
                  label={w.skip}
                  hint={w.skipHint}
                  onClick={() => showResults()}
                />
              </motion.ul>
            </>
          )}

          {step === "when" && (
            <>
              <motion.h2
                variants={item}
                className="pb-3 text-2xl font-semibold text-muted-foreground"
              >
                {w.whenTitle}
              </motion.h2>
              <motion.ul variants={list} className="flex flex-col gap-2">
                <Option
                  icon={Clock}
                  label={w.now}
                  // Default answer; the time isn't kept since picking one leaves
                  selected
                  onClick={() => showResults({ area })}
                />
                <Option
                  icon={RotateCwFadingClock}
                  label={w.pickTime}
                  hint={w.pickTimeHint}
                  onClick={() => setDrawer("time")}
                />
              </motion.ul>
            </>
          )}
        </motion.div>

        {error && (
          <p role="alert" className="pt-3 text-sm">
            {error}
          </p>
        )}

        <Drawer
          open={drawer === "area"}
          onClose={() => setDrawer(null)}
          title={w.leavingFrom}
        >
          <label className="relative block pb-3">
            <span className="sr-only">{w.searchAreas}</span>
            <Search
              className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={areaQuery}
              onChange={(e) => {
                setAreaQuery(e.target.value);
                setActive(0);
              }}
              // Combobox: focus stays here; arrows move the highlight, Enter
              // picks. (iOS's keyboard arrows only hop between form fields.)
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={matches.length > 0}
              aria-controls={listId}
              aria-activedescendant={
                matches[active] ? `${listId}-${matches[active].id}` : undefined
              }
              enterKeyHint="search"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const step = e.key === "ArrowDown" ? 1 : -1;
                  setActive((i) =>
                    Math.min(Math.max(i + step, 0), matches.length - 1),
                  );
                } else if (e.key === "Enter" && matches[active]) {
                  e.preventDefault();
                  pickArea(matches[active]);
                }
              }}
              placeholder={w.searchPlaceholder}
              className="w-full rounded-xl bg-muted py-2 pr-3 pl-9 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </label>
          {/* Nothing listed until the user types; recents fill the gap */}
          {!query &&
            (recent.length > 0 ? (
              <>
                <div className="flex items-center justify-between pb-1 text-xs text-muted-foreground">
                  <span>{w.recent}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecent([]);
                      writeRecent([]);
                    }}
                    className="cursor-pointer underline underline-offset-2 hover:text-foreground"
                  >
                    {t.common.clear}
                  </button>
                </div>
                <AreaList areas={recent} icon={History} onPick={pickArea} />
              </>
            ) : (
              <p className="py-3 text-sm text-muted-foreground">{w.typeHint}</p>
            ))}

          {query &&
            (matches.length > 0 ? (
              <AreaList
                areas={matches}
                icon={MapPin}
                onPick={pickArea}
                id={listId}
                active={active}
              />
            ) : (
              <p className="py-3 text-sm text-muted-foreground">
                {w.noAreas(query)}
              </p>
            ))}
        </Drawer>

        <Drawer
          open={drawer === "ferry"}
          onClose={() => setDrawer(null)}
          title={w.ferryTitle}
        >
          <p className="pb-1 text-sm text-muted-foreground">{w.ferryNote}</p>
          <AreaList areas={TERMINALS} icon={Ship} onPick={pickArea} />
        </Drawer>

        <Drawer
          open={drawer === "time"}
          onClose={() => setDrawer(null)}
          title={w.leavingAt}
        >
          {/* Mounted only while open, so it reads the clock at that moment */}
          {drawer === "time" && (
            <TimePicker
              onPick={(date) => {
                setDrawer(null);
                showResults({ area, at: localInputValue(date) });
              }}
            />
          )}
        </Drawer>
      </section>
    </MotionConfig>
  );
}

function AreaList({
  areas,
  icon: Icon,
  onPick,
  id,
  active,
}: {
  areas: Area[];
  icon: LucideIcon;
  onPick: (area: Area) => void;
  // Set for search results (driven by the search box); recents leave them out
  id?: string;
  active?: number;
}) {
  const { t } = useI18n();
  return (
    <div
      id={id}
      role="listbox"
      aria-label={t.wizard.areas}
      className="flex flex-col"
    >
      {areas.map((a, i) => (
        <div
          key={a.id}
          id={id ? `${id}-${a.id}` : undefined}
          role="option"
          aria-selected={i === active}
          // Search results are driven from the search box; recents get Tab
          tabIndex={id ? -1 : 0}
          onClick={() => onPick(a)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPick(a);
            }
          }}
          className={`-mx-2 flex cursor-pointer items-center gap-3 rounded-lg border-b border-border px-2 py-3 text-sm outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-primary ${id && i === active ? "bg-muted" : ""}`}
        >
          {/* Terminals in search results get a ship instead of the pin */}
          {a.kind === "terminal" && Icon === MapPin ? (
            <Ship
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : (
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
          <span className="flex flex-col">
            {a.name}
            {/* Other names explain why "Jodoh" finds Nagoya */}
            {a.aliases && (
              <span className="text-xs text-muted-foreground">
                {a.aliases.join(", ")}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnswerChip({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}. ${hint}`}
      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border py-1 pr-2 pl-3 text-sm font-medium hover:border-primary"
    >
      {label}
      <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

function Option({
  icon: Icon,
  label,
  hint,
  selected = false,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.li variants={item}>
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-muted px-6 py-4 text-left text-lg aria-pressed:font-medium aria-pressed:bg-primary/20 disabled:cursor-wait disabled:opacity-60"
      >
        <Icon
          className="size-5 shrink-0 text-primary"
          strokeWidth={2}
          aria-hidden
        />
        <span className="flex flex-col">
          {label}
          {hint && (
            <span className="text-xs font-normal text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
      </button>
    </motion.li>
  );
}
