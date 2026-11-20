// English UI text. This file defines the shape every other language must
// match (see id.ts); TypeScript flags a missing or extra key.
import type { Category, Price, Tag } from "@/data/constants";
import type { Day, OpenStatus } from "@/lib/opening";

const SHORT_DAYS: Record<Day, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const en = {
  // Page titles and descriptions for search results and link previews
  meta: {
    title: "Find a place to go in Batam",
    description: "Pick a spot for hangout, date, or food.",
    placesTitle: "All places to go in Batam",
    placeTitle: (name: string, category: string) =>
      `${name}, ${category} in Batam`,
  },
  common: {
    back: "Back",
    change: "Change",
    clear: "Clear",
    any: "Any",
    locating: "Getting your location…",
    noGeolocation: "Location isn't available in this browser.",
    away: (distance: string) => `${distance} away`,
    share: "Share",
    linkCopied: "Link copied",
  },
  header: {
    toggleTheme: "Toggle theme",
    // Label for the button that switches to the other language
    switchTo: "Ganti ke Bahasa Indonesia",
  },
  home: {
    title: "Find a place to go.",
    browseAll: "Browse all places",
  },
  categories: {
    restaurant: { label: "Restaurant", plural: "Restaurants" },
    cafe: { label: "Café", plural: "Cafés" },
    dessert: { label: "Dessert", plural: "Desserts" },
    mall: { label: "Mall", plural: "Malls" },
    park: { label: "Park", plural: "Parks" },
    bar: { label: "Bar", plural: "Bars" },
  } satisfies Record<Category, { label: string; plural: string }>,
  tags: {
    wifi: "Wi-Fi",
    work: "Good for working",
    outdoor: "Outdoor seating",
    halal: "Halal",
    parking: "Parking",
    kids: "Kid-friendly",
    smoking: "Smoking area",
  } satisfies Record<Tag, string>,
  // Typical spend per person, by price level
  prices: {
    1: "Under Rp 50k per person",
    2: "Rp 50–150k per person",
    3: "Over Rp 150k per person",
  } satisfies Record<Price, string>,
  // Keys match the ids in data/intents.ts
  intents: {
    coffee: "Coffee or a chill spot",
    hangout: "Hang out with friends",
    eat: "Something to eat",
    work: "Work or study",
  },
  wizard: {
    whatTitle: "What are you looking for?",
    anything: "Anything",
    changeWhat: "Change what you're looking for",
    fromTitle: "Where are you leaving from?",
    myLocation: "My location",
    somewhereElse: "Somewhere else",
    ferry: "Arriving by ferry",
    ferryHint: "From Singapore: HarbourBay, Batam Centre…",
    ferryTitle: "Which terminal?",
    ferryNote: "Where your ferry from Singapore docks.",
    tapToChange: "Tap to change",
    skip: "Skip to results",
    skipHint: "Near me, leaving now",
    changeFrom: "Change where you're leaving from",
    locationFailed: "Couldn't get your location. Pick an area instead?",
    whenTitle: "When are you leaving?",
    now: "Now",
    pickTime: "Pick a time",
    pickTimeHint: "Tonight, tomorrow, this weekend...",
    leavingFrom: "Leaving from",
    leavingAt: "Leaving at",
    searchAreas: "Search areas",
    searchPlaceholder: "Search an area",
    areas: "Areas",
    recent: "Recent",
    typeHint: "Type an area, like Nagoya or Batam Centre.",
    noAreas: (query: string) =>
      `No areas match “${query}”. Try a nearby neighbourhood.`,
  },
  timePicker: {
    inAnHour: "In 1 hour",
    tonight: "Tonight 7 pm",
    tomorrowLunch: "Tomorrow lunch",
    weekend: "This weekend",
    today: "Today",
    tomorrow: "Tomorrow",
    day: "Day",
    hour: "Hour",
    minute: "Minute",
    period: "AM or PM",
    tooEarly: "Pick a later time",
    show: (when: string) => `Show places · ${when}`,
  },
  browser: {
    allPlaces: "All places",
    // Opens one open, nearby place from the current results
    pickForMe: "Pick one for me",
    shareResults: "Share these results",
    shareText: "Some places to go in Batam",
    from: (area: string) => `From ${area}`,
    leaving: (when: string) => `Leaving ${when}`,
    view: "View",
    map: "Map",
    list: "List",
    search: "Search places",
    filters: "Filters",
    category: "Category",
    categories: "Categories",
    allCategories: "All",
    selected: (count: number) => `${count} selected`,
    status: "Status",
    openNow: "Open now",
    closedNow: "Closed now",
    distance: "Distance",
    features: "Features",
    allFeatures: "Any",
    price: "Price",
    priceUpTo: (symbol: string, max: string) => `${symbol} · ${max}`,
    priceMax: {
      1: "under Rp 50k",
      2: "under Rp 150k",
    },
    within: (km: number) => `Within ${km} km`,
    locationFailed: "Couldn't get your location.",
    places: (count: number) => `${count} ${count === 1 ? "place" : "places"}`,
    someOf: (count: number, total: number) => `${count} of ${total} places`,
    clearAll: "Clear all",
    sort: "Sort",
    sortDefault: "Default",
    sortName: "Name (A–Z)",
    sortNearest: "Nearest",
    editFilters: "Edit filters",
    clearFilters: "Clear filters",
    closed: "closed",
    legendClosed: "Closed",
    you: "You",
    startingPoint: (area: string) => `Starting point: ${area}`,
    noMatches: "No places match.",
    empty: "Nothing here yet.",
  },
  place: {
    backTo: (plural: string) => `Back to ${plural}`,
    photoBy: "Photo by:",
    navigate: "Navigate",
    shareText: (name: string) => `${name}, found on WhereToGo`,
    about: "About",
    goodToKnow: "Good to know",
    openingHours: "Opening hours",
    website: "Website",
    on: (name: string, site: string) => `${name} on ${site}`,
    itsWebsite: "its website",
    localTime: (timezone: string) =>
      `Times are local to the place (${timezone})`,
  },
  hours: {
    days: {
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
    } satisfies Record<Day, string>,
    closed: "Closed",
    allDay: "Open 24 hours",
  },
  status: (s: OpenStatus) => {
    switch (s.kind) {
      case "always":
        return "Open 24 hours";
      case "never":
        return "Closed";
      case "open":
        return `Open · Closes ${s.closes}`;
      case "closed": {
        const when =
          s.on === "today"
            ? ""
            : s.on === "tomorrow"
              ? "tomorrow "
              : `${SHORT_DAYS[s.on]} `;
        return `Closed · Opens ${when}${s.opens}`;
      }
    }
  },
  feedback: {
    toggle: "Send feedback",
    topicsLegend: "What's it about?",
    topics: {
      place: "Suggest a place",
      wrong: "Something's wrong",
      idea: "Idea",
      other: "Other",
    },
    message: "Your message",
    messagePlaceholder: "What's working, what isn't, or a place we should add",
    messageRequired: "Write a few words first.",
    tooLong: (max: number) => `Keep it under ${max} characters.`,
    contact: "Where can we reply?",
    optional: "Optional",
    contactPlaceholder: "Email or Telegram username",
    send: "Send feedback",
    sending: "Sending…",
    thanksTitle: "Thanks for the feedback",
    thanksBody: "It goes straight to Ricky, and every message gets read.",
    sendAnother: "Send another",
    // Server action results, by code (see app/actions/feedback.ts)
    errors: {
      invalid: "Invalid request.",
      empty: "Please write something first.",
      tooLong: "That's a bit too long.",
      rateLimited: "Too many messages. Try again later.",
      failed: "Couldn't send right now. Please try again later.",
    },
  },
  footer: {
    builtBy: "Built by",
    tagline: ", for when you can't decide where to go.",
  },
  notFound: {
    title: "Nothing here",
    body: "This page doesn't exist.",
    home: "Back to home",
  },
};

export type Dictionary = typeof en;
