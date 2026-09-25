import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, MapPin, Pill, Plus, Syringe, PawPrint } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { EmptyState } from '@/components/EmptyState';
import { LoadError } from '@/components/LoadError';
import { Spinner } from '@/components/Spinner';
import { PetSwitcher } from '@/components/PetSwitcher';
import { EventTypeIcon } from '@/components/EventTypeIcon';
import { Modal } from '@/components/Modal';
import { VaccinationForm } from '@/features/health/VaccinationForm';
import { MedicationForm } from '@/features/health/MedicationForm';
import { EventForm } from '@/features/calendar/EventForm';
import { useI18n } from '@/i18n';
import { ageFromBirthDate, formatDateHuman, todayStr } from '@/utils/date';
import {
  addEvent, addMedication, addVaccination,
  listEvents, listMedicationLogsForDate, listMedications, listVaccinations, setMedicationLog, clearMedicationLog,
} from '@/services/recordsService';
import { scheduleTodayReminders } from '@/services/reminders';
import type { CalendarEvent, MedicationLog, Medication, Vaccination } from '@/types';

type QuickForm = 'vaccination' | 'medication' | 'event' | null;

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { currentPet, loading: petsLoading, error: petsError, refresh } = usePets();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [quickForm, setQuickForm] = useState<QuickForm>(null);
  const today = todayStr();

  async function load() {
    if (!user || !currentPet) return;
    setLoading(true);
    setLoadError(false);
    let v: Vaccination[] = [], m: Medication[] = [], e: CalendarEvent[] = [], l: MedicationLog[] = [];
    try {
      [v, m, e, l] = await Promise.all([
        listVaccinations(user.uid, currentPet.id),
        listMedications(user.uid, currentPet.id),
        listEvents(user.uid, currentPet.id),
        listMedicationLogsForDate(user.uid, currentPet.id, today),
      ]);
    } catch {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setVaccinations(v); setMedications(m); setEvents(e); setLogs(l);
    setLoading(false);

    const now = new Date();
    const items = [
      ...m
        .filter((med) => med.startDate <= today && (!med.endDate || med.endDate >= today))
        .flatMap((med) => med.times.map((time) => ({ med, time })))
        .filter(({ med, time }) => !l.some((log) => log.medicationId === med.id && log.time === time))
        .map(({ med, time }) => {
          const [h, min] = time.split(':').map(Number);
          const at = new Date(now); at.setHours(h, min, 0, 0);
          return { key: `med-${med.id}-${time}-${today}`, title: med.name, body: `Пора дать лекарство · ${time}`, at: at.getTime() };
        }),
      ...e
        .filter((ev) => ev.date === today && ev.time)
        .map((ev) => {
          const [h, min] = ev.time!.split(':').map(Number);
          const at = new Date(now); at.setHours(h, min, 0, 0);
          return { key: `evt-${ev.id}-${today}`, title: ev.title, body: `Сегодня · ${ev.time}`, at: at.getTime() };
        }),
    ];
    scheduleTodayReminders(items);
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user, currentPet?.id]);

  if (petsLoading) return <Spinner />;
  if (petsError) {
    return <LoadError onRetry={refresh} />;
  }
  if (!currentPet) {
    return (
      <>
        <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('home.title')}</h1>
        <EmptyState icon={<PawPrint size={26} />} title={t('home.empty.title')} text={t('home.empty.text')}
          action={<Link to="/app/onboarding" className="btn-primary">{t('petForm.create')}</Link>} />
      </>
    );
  }

  async function toggleLog(medId: string, time: string) {
    if (!user || !currentPet) return;
    const existing = logs.find((l) => l.medicationId === medId && l.time === time && l.date === today);
    if (existing) await clearMedicationLog(user.uid, currentPet.id, medId, today, time);
    else await setMedicationLog(user.uid, currentPet.id, medId, today, time, 'taken');
    setLogs(await listMedicationLogsForDate(user.uid, currentPet.id, today));
  }

  const todaysMeds = medications
    .filter((m) => m.startDate <= today && (!m.endDate || m.endDate >= today))
    .flatMap((m) => m.times.map((time) => ({ med: m, time })))
    .sort((a, b) => a.time.localeCompare(b.time));
  const todaysEvents = events.filter((e) => e.date === today);

  const upcomingVacc = vaccinations.filter((v) => !v.administered && v.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const upcomingEvent = events.filter((e) => e.date > today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const upcomingItems = [
    upcomingVacc && { key: 'v', label: upcomingVacc.name, date: upcomingVacc.date, icon: <Syringe size={20} aria-hidden="true" /> },
    upcomingEvent && { key: 'e', label: upcomingEvent.title, date: upcomingEvent.date, icon: <EventTypeIcon type={upcomingEvent.type} /> },
  ].filter(Boolean) as { key: string; label: string; date: string; icon: React.ReactNode }[];

  async function handleAddVaccination(input: Parameters<typeof addVaccination>[2]) {
    if (!user || !currentPet) return;
    await addVaccination(user.uid, currentPet.id, input);
    await load();
    setQuickForm(null);
  }
  async function handleAddMedication(input: Parameters<typeof addMedication>[2]) {
    if (!user || !currentPet) return;
    await addMedication(user.uid, currentPet.id, input);
    await load();
    setQuickForm(null);
  }
  async function handleAddEvent(input: Parameters<typeof addEvent>[2]) {
    if (!user || !currentPet) return;
    await addEvent(user.uid, currentPet.id, input);
    await load();
    setQuickForm(null);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <PetSwitcher />
        <Link to={`/app/pets/${currentPet.id}`} className="btn-quiet">{t('pet.profile.title')}</Link>
      </div>

      {(currentPet.breed || currentPet.birthDate || currentPet.weight) && (
        <p className="mb-6 -mt-4 text-ink-soft">
          {[currentPet.breed, ageFromBirthDate(currentPet.birthDate), currentPet.weight != null ? `${currentPet.weight} ${t(`pet.weight.${currentPet.weightUnit ?? 'kg'}`)}` : null]
            .filter(Boolean).join(' · ')}
        </p>
      )}

      {loading ? <Spinner /> : loadError ? (
        <LoadError onRetry={load} />
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('dashboard.today')}</h2>
            {todaysMeds.length === 0 && todaysEvents.length === 0 ? (
              <p className="surface p-4 text-ink-soft">{t('dashboard.today.empty')}</p>
            ) : (
              <ul className="surface divide-y divide-line">
                {todaysMeds.map(({ med, time }) => {
                  const taken = logs.some((l) => l.medicationId === med.id && l.time === time);
                  return (
                    <li key={`${med.id}-${time}`} className="flex items-center gap-3 p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600"><Pill size={20} aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{med.name}</p>
                        <p className="text-sm text-ink-soft">{time} {med.dosageAmount ? `· ${med.dosageAmount} ${med.dosageUnit ?? ''}` : ''}</p>
                      </div>
                      <button type="button" onClick={() => toggleLog(med.id, time)}
                        className={`flex h-10 items-center gap-1.5 rounded-ctl px-3 text-sm font-bold ${taken ? 'bg-lagoon-600 text-white' : 'border border-line text-ink-soft'}`}>
                        <Check size={16} aria-hidden="true" /> {taken ? t('dashboard.medication.taken') : t('dashboard.medication.markTaken')}
                      </button>
                    </li>
                  );
                })}
                {todaysEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center gap-3 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600"><EventTypeIcon type={ev.type} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{ev.title}</p>
                      {ev.time && <p className="text-sm text-ink-soft">{ev.time}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('dashboard.upcoming')}</h2>
            {upcomingItems.length === 0 ? (
              <p className="surface p-4 text-ink-soft">{t('dashboard.upcoming.empty')}</p>
            ) : (
              <ul className="surface divide-y divide-line">
                {upcomingItems.map((it) => (
                  <li key={it.key} className="flex items-center gap-3 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-honey-100 text-honey-700">{it.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{it.label}</p>
                      <p className="text-sm text-ink-soft">{formatDateHuman(it.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <QuickAction icon={<Syringe size={22} aria-hidden="true" />} label={t('dashboard.addVaccination')} onClick={() => setQuickForm('vaccination')} />
              <QuickAction icon={<Pill size={22} aria-hidden="true" />} label={t('dashboard.addMedication')} onClick={() => setQuickForm('medication')} />
              <QuickAction icon={<CalendarDays size={22} aria-hidden="true" />} label={t('dashboard.addEvent')} onClick={() => setQuickForm('event')} />
              <Link to="/app/clinics" className="surface flex flex-col items-center gap-2 py-4 text-center text-sm font-semibold text-ink hover:bg-lagoon-50">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600"><MapPin size={22} aria-hidden="true" /></span>
                {t('clinics.title')}
              </Link>
            </div>
          </section>
        </div>
      )}

      {quickForm === 'vaccination' && (
        <Modal title={t('vaccination.add')} onClose={() => setQuickForm(null)}><VaccinationForm onSubmit={handleAddVaccination} /></Modal>
      )}
      {quickForm === 'medication' && (
        <Modal title={t('medication.add')} onClose={() => setQuickForm(null)}><MedicationForm onSubmit={handleAddMedication} /></Modal>
      )}
      {quickForm === 'event' && (
        <Modal title={t('calendar.add')} onClose={() => setQuickForm(null)}><EventForm onSubmit={handleAddEvent} /></Modal>
      )}
    </>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="surface flex flex-col items-center gap-2 py-4 text-center text-sm font-semibold text-ink hover:bg-lagoon-50">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600">{icon}</span>
      {label}
      <Plus size={14} className="text-ink-faint" aria-hidden="true" />
    </button>
  );
}
