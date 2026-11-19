// Starting points for "Somewhere else". Client-safe (no zod).
// ponytail: placeholder Batam areas with approximate centers; replace with
// the real list (and validate it like places.json) once it exists.
export type Area = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  // Other names people use for the same area (neighbourhoods, landmarks)
  aliases?: string[];
  // Ferry terminals get their own "Arriving by ferry" step on the home page
  kind?: "terminal";
};

export const AREAS: Area[] = [
  {
    id: "nagoya",
    name: "Nagoya",
    lat: 1.1475,
    lng: 104.0127,
    aliases: ["Jodoh", "Lubuk Baja", "Nagoya Hill"],
  },
  {
    id: "batam-centre",
    name: "Batam Centre",
    lat: 1.129,
    lng: 104.053,
    aliases: ["BC", "Batam Center", "Engku Putri"],
  },
  {
    id: "baloi",
    name: "Baloi",
    lat: 1.131,
    lng: 104.023,
    aliases: ["Baloi Indah", "Baloi Permai"],
  },
  { id: "bengkong", name: "Bengkong", lat: 1.15, lng: 104.045 },
  { id: "batu-ampar", name: "Batu Ampar", lat: 1.165, lng: 104.005 },
  { id: "sekupang", name: "Sekupang", lat: 1.115, lng: 103.948 },
  {
    id: "tiban",
    name: "Tiban",
    lat: 1.11,
    lng: 103.97,
    aliases: ["Tiban Indah", "Tiban Baru"],
  },
  { id: "batu-aji", name: "Batu Aji", lat: 1.045, lng: 103.975 },
  { id: "tanjung-uncang", name: "Tanjung Uncang", lat: 1.057, lng: 103.945 },
  {
    id: "nongsa",
    name: "Nongsa",
    lat: 1.195,
    lng: 104.11,
    aliases: ["Nongsa Digital Park"],
  },
];

// International ferry terminals with Singapore routes, for visitors who just
// arrived. Coordinates from OpenStreetMap (terminal buildings).
// Order here is the order in the "Arriving by ferry" list.
export const TERMINALS: Area[] = [
  {
    id: "harbourbay",
    name: "HarbourBay Ferry Terminal",
    lat: 1.1533,
    lng: 103.9967,
    aliases: ["Harbour Bay", "Batu Ampar ferry"],
    kind: "terminal",
  },
  {
    id: "batam-centre-ferry",
    name: "Batam Centre Ferry Terminal",
    lat: 1.1318,
    lng: 104.0554,
    aliases: ["BCFT", "Batam Center ferry", "Pelabuhan Batam Centre"],
    kind: "terminal",
  },
  {
    id: "sekupang-ferry",
    name: "Sekupang Ferry Terminal",
    lat: 1.125,
    lng: 103.925,
    aliases: ["Pelabuhan Sekupang"],
    kind: "terminal",
  },
  {
    id: "nongsa-pura",
    name: "Nongsa Pura Ferry Terminal",
    lat: 1.196,
    lng: 104.0985,
    aliases: ["Nongsa Point Marina", "Nongsapura"],
    kind: "terminal",
  },
  {
    id: "waterfront-city",
    name: "Waterfront City Ferry Terminal",
    lat: 1.0793,
    lng: 103.9304,
    aliases: ["Marina City", "Teluk Senimba"],
    kind: "terminal",
  },
];

// Everything the search box and ?from= understand
const ALL_AREAS = [...AREAS, ...TERMINALS];

export const findArea = (id: string | null) =>
  ALL_AREAS.find((area) => area.id === id) ?? null;

// Lowercase, strip accents and punctuation, so "Batam-Centre" ≈ "batam centre"
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Edit distance, for typos like "nagoia" -> "nagoya"
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[b.length];
}

// How well one name matches the query; lower is better, null = no match
function score(name: string, q: string) {
  const n = normalize(name);
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  // Any word starting with the query: "centre" finds "Batam Centre"
  if (n.split(" ").some((word) => word.startsWith(q))) return 2;
  if (n.includes(q)) return 3;
  // Typos: compare against the start of the name, allowing ~1 typo per 4 chars
  if (q.length >= 3) {
    const typos = distance(q, n.slice(0, q.length));
    if (typos <= Math.floor(q.length / 4) + (q.length >= 5 ? 1 : 0)) {
      return 4 + typos;
    }
  }
  return null;
}

// ponytail: fuzzy match over our own list only; a geocoding API would be
// needed to understand street addresses or places we haven't listed.
export function searchAreas(query: string, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  return ALL_AREAS.map((area) => {
    const scores = [area.name, ...(area.aliases ?? [])]
      .map((name) => score(name, q))
      .filter((s) => s !== null);
    // Best of the official name and its aliases
    const best = scores.length ? Math.min(...scores) : null;
    return { area, best };
  })
    .filter((r): r is { area: Area; best: number } => r.best !== null)
    .sort((a, b) => a.best - b.best || a.area.name.localeCompare(b.area.name))
    .slice(0, limit)
    .map((r) => r.area);
}
