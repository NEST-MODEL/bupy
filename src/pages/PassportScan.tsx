import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ScanLine, Trash2, Plus, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { TextField } from '@/components/TextField';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { recognizePassportText } from '@/services/ocrService';
import { parsePassportText, type ParsedVaccination } from '@/utils/passportParser';
import { updatePet } from '@/services/petService';
import { addVaccination } from '@/services/recordsService';

type Stage = 'pick' | 'recognizing' | 'review';

export default function PassportScan() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { currentPet, refresh } = usePets();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('pick');
  const [photo, setPhoto] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [rawText, setRawText] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [vaccinations, setVaccinations] = useState<ParsedVaccination[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!currentPet) {
    return <p className="text-ink-soft">{t('error.load')}</p>;
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPhoto(URL.createObjectURL(file));
    setStage('recognizing');
    setProgress(0);
    try {
      const text = await recognizePassportText(file, setProgress);
      setRawText(text);
      const parsed = parsePassportText(text);
      setBreed(parsed.breed ?? '');
      setBirthDate(parsed.birthDate ?? '');
      setMicrochip(parsed.microchipNumber ?? '');
      setVaccinations(parsed.vaccinations);
      setStage('review');
    } catch {
      setError(t('passport.error'));
      setStage('pick');
    }
  }

  function discardPhoto() {
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(null);
  }

  function updateVacc(i: number, patch: Partial<ParsedVaccination>) {
    setVaccinations((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  }
  function removeVacc(i: number) {
    setVaccinations((vs) => vs.filter((_, j) => j !== i));
  }

  async function handleSave() {
    if (!user || !currentPet) return;
    setSaving(true);
    setError(null);
    try {
      const petPatch: Record<string, string> = {};
      if (breed.trim() && !currentPet.breed) petPatch.breed = breed.trim();
      if (birthDate && !currentPet.birthDate) petPatch.birthDate = birthDate;
      if (microchip.trim() && !currentPet.microchipNumber) petPatch.microchipNumber = microchip.trim();
      if (Object.keys(petPatch).length) {
        await updatePet(user.uid, currentPet.id, { ...petPatch, ...(petPatch.microchipNumber ? { microchipped: true } : {}) });
      }
      for (const v of vaccinations) {
        if (v.name.trim() && v.date) await addVaccination(user.uid, currentPet.id, { name: v.name.trim(), date: v.date, administered: true });
      }
      await refresh();
      setSaved(true);
      discardPhoto();
      setTimeout(() => navigate('/app/health'), 900);
    } catch {
      setError(t('common.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Link to="/app/health" aria-label={t('auth.back')} className="-ml-2 mb-4 flex h-11 w-11 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50">
        <ArrowLeft size={22} aria-hidden="true" />
      </Link>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight">{t('passport.title')}</h1>

      {stage === 'pick' && (
        <>
          <p className="mb-5 text-ink-soft">{t('passport.intro')}</p>
          <FormError message={error} />
          <div className="mt-4 flex flex-col gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-primary">
              <Camera size={20} aria-hidden="true" /> {t('passport.takePhoto')}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
          </div>
        </>
      )}

      {stage === 'recognizing' && (
        <div className="flex flex-col items-center gap-4 py-10">
          {photo && <img src={photo} alt="" className="max-h-56 rounded-card object-contain" />}
          <ScanLine size={28} className="animate-pulse text-lagoon-600" aria-hidden="true" />
          <p className="font-semibold text-ink-soft">Распознаём текст… {progress}%</p>
        </div>
      )}

      {stage === 'review' && (
        <div className="flex flex-col gap-5">
          <div className="surface p-4">
            <p className="mb-1 font-bold">{t('passport.review.title')}</p>
            <p className="text-sm text-ink-soft">{t('passport.review.text')}</p>
          </div>

          <FormError message={error} />

          <TextField label={t('passport.field.breed')} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="—" />
          <TextField label={t('passport.field.birthDate')} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <TextField label={t('passport.field.microchip')} value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="—" />
          {!breed && !birthDate && !microchip && <p className="-mt-2 text-sm text-honey-700">{t('passport.review.notRecognized')}</p>}

          <div>
            <p className="label">{t('passport.vaccinations.title')}</p>
            {vaccinations.length === 0 && <p className="mb-2 text-sm text-ink-faint">{t('passport.vaccinations.empty')}</p>}
            <div className="flex flex-col gap-3">
              {vaccinations.map((v, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1"><TextField label="Вакцина" value={v.name} onChange={(e) => updateVacc(i, { name: e.target.value })} /></div>
                  <div className="w-40"><TextField label="Дата" type="date" value={v.date} onChange={(e) => updateVacc(i, { date: e.target.value })} /></div>
                  <button type="button" onClick={() => removeVacc(i)} aria-label={t('common.remove')} className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-ctl text-ink-soft hover:bg-berry-100 hover:text-berry-700">
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setVaccinations((vs) => [...vs, { name: '', date: '' }])} className="btn-quiet self-start -ml-3">
                <Plus size={18} aria-hidden="true" /> {t('passport.vaccinations.add')}
              </button>
            </div>
          </div>

          {photo && (
            <div className="surface p-4">
              <img src={photo} alt="" className="mb-3 max-h-48 w-full rounded-ctl object-contain" />
              <p className="mb-2 text-sm text-ink-faint">{t('passport.deletePhoto')}</p>
              <button type="button" onClick={discardPhoto} className="btn-quiet -ml-3 text-berry-700"><Trash2 size={18} aria-hidden="true" /> {t('passport.discardPhoto')}</button>
            </div>
          )}

          <details className="surface p-4 text-sm">
            <summary className="cursor-pointer font-semibold text-ink-soft">{t('passport.rawText')}</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-ink-faint">{rawText}</pre>
          </details>

          {saved && <p role="status" className="text-lagoon-700">{t('passport.saved')}</p>}
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">{t('passport.save')}</button>
        </div>
      )}
    </>
  );
}
