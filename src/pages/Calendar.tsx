import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays, Trash2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EventTypeIcon } from '@/components/EventTypeIcon';
import { EventForm } from '@/features/calendar/EventForm';
import { useI18n } from '@/i18n';
import { formatDateHuman, todayStr } from '@/utils/date';
import { LoadError } from '@/components/LoadError';
import { addEvent, deleteEvent, listEvents, type EventInput } from '@/services/recordsService';
import type { CalendarEvent } from '@/types';

export default function Calendar() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { currentPet, loading: petsLoading } = usePets();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  async function load() {
    if (!user || !currentPet) return;
    setLoading(true);
    setLoadError(false);
    try {
      setEvents(await listEvents(user.uid, currentPet.id));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user, currentPet?.id]);

  if (petsLoading) return <Spinner />;
  if (!currentPet) {
    return (
      <>
        <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('calendar.title')}</h1>
        <EmptyState icon={<CalendarDays size={26} />} title={t('home.empty.title')} text={t('home.empty.text')}
          action={<Link to="/app/onboarding" className="btn-primary">{t('pet.addAnother')}</Link>} />
      </>
    );
  }

  async function handleAdd(input: EventInput) {
    if (!user || !currentPet) return;
    await addEvent(user.uid, currentPet.id, input);
    await load();
    setShowForm(false);
  }
  async function handleDelete() {
    if (!user || !currentPet || !toDelete) return;
    await deleteEvent(user.uid, currentPet.id, toDelete);
    setToDelete(null);
    await load();
  }

  const today = todayStr();
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')));
  const past = events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('calendar.title')}</h1>
        <button type="button" onClick={() => setShowForm(true)} className="btn-quiet"><Plus size={20} aria-hidden="true" />{t('common.add')}</button>
      </div>

      {loading ? <Spinner /> : loadError ? (
        <LoadError onRetry={load} />
      ) : events.length === 0 ? (
        <EmptyState icon={<CalendarDays size={26} />} title={t('calendar.empty.title')} text={t('calendar.empty.text')}
          action={<button type="button" onClick={() => setShowForm(true)} className="btn-primary">{t('calendar.add')}</button>} />
      ) : (
        <div className="flex flex-col gap-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('calendar.upcoming')}</h2>
              <EventList items={upcoming} onDelete={setToDelete} />
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('calendar.past')}</h2>
              <div className="opacity-70"><EventList items={past} onDelete={setToDelete} /></div>
            </section>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={t('calendar.add')} onClose={() => setShowForm(false)}>
          <EventForm onSubmit={handleAdd} />
        </Modal>
      )}
      {toDelete && (
        <ConfirmDialog title={t('common.confirmDeleteTitle')} text={t('calendar.delete.confirm')} confirmLabel={t('common.delete')} danger
          onConfirm={handleDelete} onClose={() => setToDelete(null)} />
      )}
    </>
  );
}

function EventList({ items, onDelete }: { items: CalendarEvent[]; onDelete: (id: string) => void }) {
  return (
    <ul className="surface divide-y divide-line">
      {items.map((ev) => (
        <li key={ev.id} className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600"><EventTypeIcon type={ev.type} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{ev.title}</p>
            <p className="text-sm text-ink-soft">{formatDateHuman(ev.date)}{ev.time ? ` · ${ev.time}` : ''}</p>
          </div>
          <button type="button" onClick={() => onDelete(ev.id)} aria-label="Удалить" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl text-ink-faint hover:bg-berry-100 hover:text-berry-700">
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
