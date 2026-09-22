import { useRef, useState, type FormEvent } from 'react';
import { Camera, Cat, Dog } from 'lucide-react';
import { TextField } from '@/components/TextField';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { compressImageToDataUrl } from '@/utils/image';
import type { Pet, Sex, Species, WeightUnit } from '@/types';
import type { PetInput } from '@/services/petService';

interface Props {
  initial?: Pet;
  onSubmit: (input: PetInput) => Promise<void>;
  submitLabel: string;
}

export function PetForm({ initial, onSubmit, submitLabel }: Props) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [species, setSpecies] = useState<Species>(initial?.species ?? 'dog');
  const [name, setName] = useState(initial?.name ?? '');
  const [photo, setPhoto] = useState<string | undefined>(initial?.photoDataUrl);
  const [breed, setBreed] = useState(initial?.breed ?? '');
  const [sex, setSex] = useState<Sex | ''>(initial?.sex ?? '');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [weight, setWeight] = useState(initial?.weight != null ? String(initial.weight) : '');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(initial?.weightUnit ?? 'kg');
  const [color, setColor] = useState(initial?.color ?? '');
  const [features, setFeatures] = useState(initial?.features ?? '');
  const [neutered, setNeutered] = useState(initial?.neutered ?? false);
  const [microchipped, setMicrochipped] = useState(initial?.microchipped ?? false);
  const [microchipNumber, setMicrochipNumber] = useState(initial?.microchipNumber ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await compressImageToDataUrl(file));
    } catch {
      setFormError(t('error.generic'));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setNameError(t('petForm.nameRequired')); return; }
    setNameError(undefined);
    setBusy(true);
    try {
      const input: PetInput = {
        species,
        name: name.trim(),
        ...(photo ? { photoDataUrl: photo } : {}),
        ...(breed.trim() ? { breed: breed.trim() } : {}),
        ...(sex ? { sex } : {}),
        ...(birthDate ? { birthDate } : {}),
        ...(weight.trim() ? { weight: Number(weight), weightUnit } : {}),
        ...(color.trim() ? { color: color.trim() } : {}),
        ...(features.trim() ? { features: features.trim() } : {}),
        neutered,
        microchipped,
        ...(microchipped && microchipNumber.trim() ? { microchipNumber: microchipNumber.trim() } : {}),
        ...(city.trim() ? { city: city.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(initial?.archived ? { archived: initial.archived } : {}),
      };
      await onSubmit(input);
    } catch {
      setFormError(t('common.saveError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={formError} />

      <div>
        <span className="label">{t('onboarding.species.prompt')}</span>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setSpecies('dog')}
            className={`flex min-h-[64px] items-center justify-center gap-2 rounded-ctl border-2 font-bold ${species === 'dog' ? 'border-lagoon-600 bg-lagoon-50 text-lagoon-700' : 'border-line text-ink-soft'}`}>
            <Dog size={24} aria-hidden="true" /> {t('pet.species.dog')}
          </button>
          <button type="button" onClick={() => setSpecies('cat')}
            className={`flex min-h-[64px] items-center justify-center gap-2 rounded-ctl border-2 font-bold ${species === 'cat' ? 'border-lagoon-600 bg-lagoon-50 text-lagoon-700' : 'border-line text-ink-soft'}`}>
            <Cat size={24} aria-hidden="true" /> {t('pet.species.cat')}
          </button>
        </div>
      </div>

      <div>
        <span className="label">{t('petForm.photo')}</span>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-mist text-ink-faint">
            {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Camera size={26} aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-quiet">
            {photo ? t('petForm.photo.change') : t('petForm.photo.add')}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPickPhoto} />
        </div>
      </div>

      <TextField label={t('petForm.name')} value={name} onChange={(e) => setName(e.target.value)} error={nameError} />
      <TextField label={t('petForm.breed')} value={breed} onChange={(e) => setBreed(e.target.value)} />

      <Select label={t('petForm.sex')} value={sex} onChange={(e) => setSex(e.target.value as Sex | '')}>
        <option value="">{t('petForm.sex.unset')}</option>
        <option value="male">{t('pet.sex.male')}</option>
        <option value="female">{t('pet.sex.female')}</option>
      </Select>

      <TextField label={t('petForm.birthDate')} type="date" max={new Date().toISOString().slice(0, 10)} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <TextField label={t('petForm.weight')} type="number" inputMode="decimal" min={0} step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <Select label="Ед." className="min-w-[84px]" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}>
          <option value="kg">{t('pet.weight.kg')}</option>
          <option value="g">{t('pet.weight.g')}</option>
          <option value="lb">{t('pet.weight.lb')}</option>
        </Select>
      </div>

      <TextField label={t('petForm.color')} value={color} onChange={(e) => setColor(e.target.value)} />
      <TextField label={t('petForm.features')} value={features} onChange={(e) => setFeatures(e.target.value)} />
      <Checkbox label={t('petForm.neutered')} checked={neutered} onChange={(e) => setNeutered(e.target.checked)} />
      <Checkbox label={t('petForm.microchipped')} checked={microchipped} onChange={(e) => setMicrochipped(e.target.checked)} />
      {microchipped && <TextField label={t('petForm.microchipNumber')} value={microchipNumber} onChange={(e) => setMicrochipNumber(e.target.value)} />}
      <TextField label={t('petForm.city')} value={city} onChange={(e) => setCity(e.target.value)} />
      <TextField label={t('petForm.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <button type="submit" className="btn-primary mt-2" disabled={busy}>{submitLabel}</button>
    </form>
  );
}
