import { useState, type FormEvent } from 'react';
import { TextField } from '@/components/TextField';
import { Checkbox } from '@/components/Checkbox';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { todayStr } from '@/utils/date';
import type { VaccinationInput } from '@/services/recordsService';

export function VaccinationForm({ onSubmit }: { onSubmit: (input: VaccinationInput) => Promise<void> }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayStr());
  const [administered, setAdministered] = useState(true);
  const [batch, setBatch] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [clinic, setClinic] = useState('');
  const [vet, setVet] = useState('');
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setNameError(t('validation.required')); return; }
    setNameError(undefined);
    setBusy(true);
    try {
      await onSubmit({
        name: name.trim(), date, administered,
        ...(batch.trim() ? { batch: batch.trim() } : {}),
        ...(manufacturer.trim() ? { manufacturer: manufacturer.trim() } : {}),
        ...(clinic.trim() ? { clinic: clinic.trim() } : {}),
        ...(vet.trim() ? { vet: vet.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
    } catch {
      setFormError(t('common.saveError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={formError} />
      <TextField label={t('vaccination.name')} value={name} onChange={(e) => setName(e.target.value)} error={nameError} />
      <TextField label={t('vaccination.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Checkbox label={t('vaccination.administered')} checked={administered} onChange={(e) => setAdministered(e.target.checked)} />
      <TextField label={t('vaccination.batch')} value={batch} onChange={(e) => setBatch(e.target.value)} />
      <TextField label={t('vaccination.manufacturer')} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
      <TextField label={t('vaccination.clinic')} value={clinic} onChange={(e) => setClinic(e.target.value)} />
      <TextField label={t('vaccination.vet')} value={vet} onChange={(e) => setVet(e.target.value)} />
      <TextField label={t('vaccination.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button type="submit" className="btn-primary mt-2" disabled={busy}>{t('common.add')}</button>
    </form>
  );
}
