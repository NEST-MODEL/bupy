// Только бесплатные/открытые источники: Nominatim (геокодинг) и Overpass API (данные OSM).
// Никаких платных Google Maps API. Соблюдаем вежливые лимиты: короткий таймаут, без повторов подряд.

export interface GeoPoint { lat: number; lon: number; displayName: string }

export interface Clinic {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  distanceKm?: number;
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function geocodeCity(query: string): Promise<GeoPoint | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error('geocode failed');
  const data: { lat: string; lon: string; display_name: string }[] = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name };
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function findVetClinics(center: { lat: number; lon: number }, radiusMeters = 8000): Promise<Clinic[]> {
  const query = `[out:json][timeout:15];(node["amenity"="veterinary"](around:${radiusMeters},${center.lat},${center.lon});way["amenity"="veterinary"](around:${radiusMeters},${center.lat},${center.lon}););out center tags;`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  let res: Response;
  try {
    res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error('overpass failed');
  const data: { elements: OverpassElement[] } = await res.json();

  const clinics: Clinic[] = data.elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) return null;
      const tags = el.tags ?? {};
      const address = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', ') || tags['addr:full'];
      const clinic: Clinic = {
        id: String(el.id),
        name: tags.name || 'Ветеринарная клиника',
        lat, lon,
        ...(address ? { address } : {}),
        ...(tags.phone || tags['contact:phone'] ? { phone: tags.phone || tags['contact:phone'] } : {}),
        ...(tags.website || tags['contact:website'] ? { website: tags.website || tags['contact:website'] } : {}),
        ...(tags.opening_hours ? { openingHours: tags.opening_hours } : {}),
        distanceKm: haversineKm(center, { lat, lon }),
      };
      return clinic;
    })
    .filter((c): c is Clinic => c !== null)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return clinics;
}

export function directionsUrl(clinic: Clinic): string {
  // Открывает выбор карт у пользователя — не вызов платного API, просто ссылка.
  return `https://www.openstreetmap.org/directions?to=${clinic.lat}%2C${clinic.lon}`;
}
