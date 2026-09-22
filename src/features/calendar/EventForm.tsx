import { useState, type FormEvent } from 'react';
import { TextField } from '@/components/TextField';
import { Select } from '@/components/Select';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { todayStr } from '@/utils/date';
import { EVENT_TYPES, type EventType } from '@/types';
import type { EventInput } from '@/services/recordsService';

export function EventForm({ onSubmit }: { onSubmit: (input: EventInput) => Promise<void> }) {
  const { t } = useI18n();
  const [type, setType] = useState<EventType>('vet');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) { setTitleError(t('validation.required')); return; }
    setTitleError(undefined);
    setBusy(true);
    try {
      await onSubmit({ type, title: title.trim(), date, ...(time ? { time } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}) });
    } catch {
      setFormError(t('common.saveError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={formError} />
      <Select label={t('calendar.type')} value={type} onChange={(e) => setType(e.target.value as EventType)}>
        {EVENT_TYPES.map((et) => <option key={et} value={et}>{t(`calendar.type.${et}`)}</option>)}
      </Select>
      <TextField label={t('calendar.eventTitle')} value={title} onChange={(e) => setTitle(e.target.value)} error={titleError} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label={t('calendar.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextField label={t('calendar.time')} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <TextField label={t('calendar.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button type="submit" className="btn-primary mt-2" disabled={busy}>{t('common.add')}</button>
    </form>
  );
}
