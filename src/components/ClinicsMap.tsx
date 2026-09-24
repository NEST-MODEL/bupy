import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Clinic } from '@/services/clinicsService';

// Иконки Leaflet по умолчанию ссылаются на файлы через относительный путь, который ломается
// при сборке Vite — подключаем через явный import, чтобы маркеры отображались.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export function ClinicsMap({ center, clinics }: { center: { lat: number; lon: number }; clinics: Clinic[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { attributionControl: true }).setView([center.lat, center.lon], 13);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([center.lat, center.lon], { icon: defaultIcon }).addTo(map).bindPopup('Вы здесь');
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lon]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: L.Marker[] = [];
    clinics.forEach((c) => {
      const m = L.marker([c.lat, c.lon], { icon: defaultIcon }).addTo(map).bindPopup(c.name);
      markers.push(m);
    });
    return () => { markers.forEach((m) => m.remove()); };
  }, [clinics]);

  return <div ref={ref} className="h-64 w-full overflow-hidden rounded-card border border-line" role="img" aria-label="Карта с клиниками" />;
}
