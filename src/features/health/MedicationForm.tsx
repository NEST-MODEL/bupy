import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { TextField } from '@/components/TextField';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { todayStr } from '@/utils/date';
import type { MedicationInput } from '@/services/recordsService';

export function MedicationForm({ onSubmit }: { onSubmit: (input: MedicationInput) => Promise<void> }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [dosageAmount, setDosageAmount] = useState('');
  const [dosageUnit, setDosageUnit] = useState('');
  const [times, setTimes] = useState<string[]>(['10:00']);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
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
        name: name.trim(),
        times: times.filter(Boolean),
        startDate,
        ...(dosageAmount.trim() ? { dosageAmount: dosageAmount.trim() } : {}),
        ...(dosageUnit.trim() ? { dosageUnit: dosageUnit.trim() } : {}),
        ...(endDate ? { endDate } : {}),
        ...(prescribedBy.trim() ? { prescribedBy: prescribedBy.trim() } : {}),
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
      <TextField label={t('medication.name')} value={name} onChange={(e) => setName(e.target.value)} error={nameError} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label={t('medication.dosageAmount')} value={dosageAmount} onChange={(e) => setDosageAmount(e.target.value)} placeholder="1" />
        <TextField label={t('medication.dosageUnit')} value={dosageUnit} onChange={(e) => setDosageUnit(e.target.value)} placeholder="таблетка" />
      </div>

      <div>
        <span className="label">{t('medication.times')}</span>
        <div className="flex flex-col gap-2">
          {times.map((time, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="time" value={time} onChange={(e) => setTimes((ts) => ts.map((t2, j) => (j === i ? e.target.value : t2)))} className="field" />
              {times.length > 1 && (
                <button type="button" onClick={() => setTimes((ts) => ts.filter((_, j) => j !== i))} aria-label={t('common.remove')}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-ctl text-ink-soft hover:bg-mist">
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setTimes((ts) => [...ts, '10:00'])} className="btn-quiet self-start -ml-3">
            <Plus size={18} aria-hidden="true" /> {t('medication.times.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField label={t('medication.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <TextField label={t('medication.endDate')} type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <TextField label={t('medication.prescribedBy')} value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} />
      <TextField label={t('medication.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button type="submit" className="btn-primary mt-2" disabled={busy}>{t('common.add')}</button>
    </form>
  );
}
