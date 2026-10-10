type Point = { lat: number; lng: number };

// Straight-line ("as the crow flies") distance on Earth, in km.
// ponytail: not road distance; add a routing API if travel time matters.
export function distanceKm(a: Point, b: Point) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// 850 m, 1.2 km, 12 km
export function formatDistance(km: number) {
  const meters = Math.round(km * 100) * 10;
  if (meters < 1000) return `${meters} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
