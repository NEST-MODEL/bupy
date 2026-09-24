import { useState } from 'react';
import { MapPin, Navigation, Phone, Globe, Search, LocateFixed } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { TextField } from '@/components/TextField';
import { ClinicsMap } from '@/components/ClinicsMap';
import { useI18n } from '@/i18n';
import { findVetClinics, geocodeCity, directionsUrl, type Clinic, type GeoPoint } from '@/services/clinicsService';

export default function Clinics() {
  const { t } = useI18n();
  const [center, setCenter] = useState<GeoPoint | null>(null);
  const [clinics, setClinics] = useState<Clinic[] | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadClinics(point: { lat: number; lon: number }) {
    setLoading(true);
    setError(null);
    try {
      setClinics(await findVetClinics(point));
    } catch {
      setError(t('clinics.error'));
      setClinics(null);
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    setError(null);
    if (!navigator.geolocation) { setError(t('clinics.locationDenied')); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude, displayName: t('clinics.searchNear') };
        setCenter(point);
        await loadClinics(point);
      },
      () => { setLoading(false); setError(t('clinics.locationDenied')); },
      { timeout: 10_000 },
    );
  }

  async function searchCity(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const point = await geocodeCity(city.trim());
      if (!point) { setError(t('clinics.empty')); setClinics([]); setLoading(false); return; }
      setCenter(point);
      await loadClinics(point);
    } catch {
      setError(t('clinics.error'));
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('clinics.title')}</h1>

      <div className="mb-5 flex flex-col gap-3">
        <button type="button" onClick={useMyLocation} className="btn-primary"><LocateFixed size={20} aria-hidden="true" />{t('clinics.searchNear')}</button>
        <form onSubmit={searchCity} className="flex items-end gap-2">
          <div className="flex-1"><TextField label={t('clinics.searchCity')} placeholder={t('clinics.searchCity.placeholder')} value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <button type="submit" className="btn-secondary !w-auto px-4"><Search size={20} aria-hidden="true" /></button>
        </form>
      </div>

      {loading && <Spinner />}
      {!loading && error && <p role="alert" className="mb-4 text-berry-700">{error}</p>}

      {!loading && center && clinics && clinics.length > 0 && (
        <div className="mb-5"><ClinicsMap center={center} clinics={clinics} /></div>
      )}

      {!loading && clinics && clinics.length === 0 && !error && (
        <EmptyState icon={<MapPin size={26} />} title={t('clinics.empty')} text="" />
      )}

      {!loading && clinics && clinics.length > 0 && (
        <ul className="surface divide-y divide-line">
          {clinics.map((c) => (
            <li key={c.id} className="p-4">
              <p className="font-bold">{c.name}</p>
              {c.address && <p className="text-sm text-ink-soft">{c.address}</p>}
              {c.distanceKm != null && <p className="text-sm text-ink-faint">{c.distanceKm.toFixed(1)} км · {c.openingHours || t('clinics.noData')}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={directionsUrl(c)} target="_blank" rel="noreferrer" className="btn-quiet border border-line !w-auto px-3">
                  <Navigation size={16} aria-hidden="true" /> {t('clinics.route')}
                </a>
                {c.phone && <a href={`tel:${c.phone}`} className="btn-quiet border border-line !w-auto px-3"><Phone size={16} aria-hidden="true" /> {t('clinics.call')}</a>}
                {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="btn-quiet border border-line !w-auto px-3"><Globe size={16} aria-hidden="true" /> {t('clinics.website')}</a>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && clinics && clinics.length > 0 && <p className="mt-3 text-xs text-ink-faint">{t('clinics.source')}</p>}
    </>
  );
}
